import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import type { Request } from 'express';
import { Model } from 'mongoose';
import twilio = require('twilio');
import {
  CallRecordingCallbackDto,
  CallStatusCallbackDto,
  IncomingCallWebhookDto,
  MakeCallDto,
} from './dto/create.dto';
import {
  CallDirection,
  CallLog,
  CallLogDocument,
  CallStatus,
} from './entities/call.entities';

@Injectable()
export class CallService {
  private readonly client: twilio.Twilio;
  private readonly fromNumber: string;
  private readonly authToken: string;
  private readonly logger = new Logger(CallService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(CallLog.name)
    private readonly callLogModel: Model<CallLogDocument>,
  ) {
    const accountSid = this.configService.getOrThrow<string>('TWILIO_ACCOUNT_SID');
    this.authToken = this.configService.getOrThrow<string>('TWILIO_AUTH_TOKEN');
    this.fromNumber = this.configService.getOrThrow<string>('TWILIO_PHONE_NUMBER');
    this.client = twilio(accountSid, this.authToken);
  }

  async makeCall(makeCallDto: MakeCallDto): Promise<CallLogDocument> {
    const { to, message, recordingCallbackUrl, statusCallbackUrl } = makeCallDto;
    const resolvedStatusCallbackUrl =
      statusCallbackUrl || this.getHttpWebhookUrl('/api/v1/call/status');
    const resolvedRecordingCallbackUrl =
      recordingCallbackUrl || this.getHttpWebhookUrl('/api/v1/call/recording');
    const shouldRecordCall =
      Boolean(resolvedRecordingCallbackUrl) &&
      (Boolean(recordingCallbackUrl) ||
        this.getBooleanConfig('TWILIO_RECORD_CALLS', true));

    const log = new this.callLogModel({
      to,
      from: this.fromNumber,
      message,
      direction: CallDirection.OUTBOUND,
      recordingCallbackUrl: shouldRecordCall
        ? resolvedRecordingCallbackUrl
        : undefined,
      statusCallbackUrl: resolvedStatusCallbackUrl,
    });

    try {
      const response = await this.client.calls.create({
        from: this.fromNumber,
        to,
        twiml: this.buildAiVoiceTwiml(message),
        ...(resolvedStatusCallbackUrl && {
          statusCallback: resolvedStatusCallbackUrl,
          statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
          statusCallbackMethod: 'POST',
        }),
        ...(shouldRecordCall && {
          record: true,
          recordingChannels: 'dual',
          recordingTrack: 'both',
          recordingStatusCallback: resolvedRecordingCallbackUrl,
          recordingStatusCallbackMethod: 'POST',
          recordingStatusCallbackEvent: ['in-progress', 'completed', 'absent'],
        }),
      });

      log.twilioCallSid = response.sid;
      log.status = CallStatus.INITIATED;
      this.logger.log(`Call initiated to ${to} | SID: ${response.sid}`);
      if (shouldRecordCall) {
        this.logger.log(
          `Call recording enabled | SID: ${response.sid} | callback: ${resolvedRecordingCallbackUrl}`,
        );
      }
    } catch (error) {
      log.status = CallStatus.FAILED;
      log.errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to initiate call to ${to}`, error);
      await log.save();
      throw new InternalServerErrorException('Failed to initiate call');
    }

    return log.save();
  }

  async getCallLogs(): Promise<CallLogDocument[]> {
    return this.callLogModel.find().sort({ createdAt: 'desc' });
  }

  async handleStatusCallback(
    callbackDto: CallStatusCallbackDto,
  ): Promise<CallLogDocument | null> {
    const status = this.normalizeCallStatus(callbackDto.CallStatus);

    const updatedLog = await this.callLogModel.findOneAndUpdate(
      { twilioCallSid: callbackDto.CallSid },
      {
        status,
        ...(callbackDto.CallDuration && {
          callDuration: callbackDto.CallDuration,
        }),
      },
      { returnDocument: 'after' },
    );

    if (!updatedLog) {
      this.logger.warn(`Call status received for unknown SID: ${callbackDto.CallSid}`);
    }

    return updatedLog;
  }

  async handleIncomingCall(
    callbackDto: IncomingCallWebhookDto,
  ): Promise<CallLogDocument | null> {
    if (!callbackDto.CallSid) {
      return null;
    }

    const message =
      callbackDto.message ||
      'Hello, you are connected with YOLO HEAT. How can I help you today?';

    return this.callLogModel.findOneAndUpdate(
      { twilioCallSid: callbackDto.CallSid },
      {
        to: callbackDto.To || this.fromNumber,
        from: callbackDto.From,
        message,
        direction: CallDirection.INBOUND,
        twilioCallSid: callbackDto.CallSid,
        status: this.normalizeCallStatus(callbackDto.CallStatus || 'in-progress'),
      },
      { upsert: true, returnDocument: 'after' },
    );
  }

  async handleRecordingCallback(
    callbackDto: CallRecordingCallbackDto,
  ): Promise<CallLogDocument | null> {
    const updatedLog = await this.callLogModel.findOneAndUpdate(
      { twilioCallSid: callbackDto.CallSid },
      {
        recordingSid: callbackDto.RecordingSid,
        recordingUrl: callbackDto.RecordingUrl,
        ...(callbackDto.RecordingDuration && {
          recordingDuration: callbackDto.RecordingDuration,
        }),
        ...(callbackDto.RecordingStatus && {
          recordingStatus: callbackDto.RecordingStatus,
        }),
        ...(callbackDto.ErrorCode && {
          errorMessage: `Recording error: ${callbackDto.ErrorCode}`,
        }),
      },
      { returnDocument: 'after' },
    );

    if (!updatedLog) {
      this.logger.warn(`Recording received for unknown SID: ${callbackDto.CallSid}`);
    }

    return updatedLog;
  }

  buildIncomingAiVoiceTwiml(
    message = 'Hello, you are connected with YOLO HEAT. How can I help you today?',
    req?: Request,
  ): string {
    return this.buildAiVoiceTwiml(message, req);
  }

  validateTwilioWebhook(req: Request): void {
    if (!this.shouldValidateTwilioWebhooks()) {
      return;
    }

    const signature = req.header('x-twilio-signature');

    if (!signature) {
      throw new ForbiddenException('Missing Twilio signature');
    }

    const url = this.getRequestValidationUrl(req);
    const params = req.body && typeof req.body === 'object' ? req.body : {};
    const isValid = twilio.validateRequest(
      this.authToken,
      signature,
      url,
      params,
    );

    if (!isValid) {
      throw new ForbiddenException('Invalid Twilio signature');
    }
  }

  private buildAiVoiceTwiml(message: string, req?: Request): string {
    const streamUrl = this.getAiStreamUrl(req);
    const voiceResponse = new twilio.twiml.VoiceResponse();

    const connect = voiceResponse.connect();
    const stream = connect.stream({
      url: streamUrl,
    });

    if (message) {
      (stream as any).parameter({
        name: 'initialMessage',
        value: message,
      });
    }

    return voiceResponse.toString();
  }

  private getAiStreamUrl(req?: Request): string {
    const explicitStreamUrl = this.getConfigValue('TWILIO_AI_STREAM_URL');

    if (explicitStreamUrl) {
      return this.withStreamToken(explicitStreamUrl);
    }

    const webhookBaseUrl =
      this.getConfigValue('TWILIO_WEBHOOK_BASE_URL') ||
      (req ? this.getRequestBaseUrl(req) : undefined);

    if (!webhookBaseUrl) {
      throw new BadRequestException(
        'TWILIO_WEBHOOK_BASE_URL or TWILIO_AI_STREAM_URL is required for AI voice calls',
      );
    }

    const baseUrl = webhookBaseUrl.replace(/\/$/, '');
    const wsBaseUrl = baseUrl
      .replace(/^https:\/\//, 'wss://')
      .replace(/^http:\/\//, 'ws://');

    return this.withStreamToken(`${wsBaseUrl}/api/v1/call/ai-stream`);
  }

  private withStreamToken(streamUrl: string): string {
    const streamToken = this.getConfigValue('TWILIO_STREAM_AUTH_TOKEN');

    if (!streamToken) {
      return streamUrl;
    }

    const url = new URL(streamUrl);
    url.searchParams.set('token', streamToken);

    return url.toString();
  }

  private getHttpWebhookUrl(path: string): string | undefined {
    const webhookBaseUrl = this.getConfigValue('TWILIO_WEBHOOK_BASE_URL');

    if (!webhookBaseUrl) {
      return undefined;
    }

    return `${webhookBaseUrl.replace(/\/$/, '')}${path}`;
  }

  private getBooleanConfig(key: string, defaultValue = false): boolean {
    const value = this.getConfigValue(key);

    if (value === undefined) {
      return defaultValue;
    }

    return ['1', 'true', 'yes', 'on'].includes(
      value.toLowerCase(),
    );
  }

  private shouldValidateTwilioWebhooks(): boolean {
    const explicit = this.getConfigValue('TWILIO_VALIDATE_WEBHOOKS');

    if (explicit !== undefined) {
      return !['0', 'false', 'no', 'off'].includes(explicit.toLowerCase());
    }

    return this.getConfigValue('NODE_ENV') === 'production';
  }

  private getRequestValidationUrl(req: Request): string {
    const webhookBaseUrl = this.getConfigValue('TWILIO_WEBHOOK_BASE_URL');

    if (webhookBaseUrl) {
      return `${webhookBaseUrl.replace(/\/$/, '')}${req.originalUrl}`;
    }

    return `${this.getRequestBaseUrl(req)}${req.originalUrl}`;
  }

  private getRequestBaseUrl(req: Request): string {
    const protocol = req.header('x-forwarded-proto') || req.protocol;
    const host = req.header('x-forwarded-host') || req.header('host');

    return `${protocol}://${host}`;
  }

  private getConfigValue(key: string): string | undefined {
    const configValue = this.configService.get<string>(key);
    const processValue = process.env[key];
    const value = configValue || processValue;
    const normalizedValue = value?.trim();

    return normalizedValue || undefined;
  }

  private normalizeCallStatus(status: string): CallStatus {
    const allowedStatuses = Object.values(CallStatus);

    if (allowedStatuses.includes(status as CallStatus)) {
      return status as CallStatus;
    }

    return CallStatus.IN_PROGRESS;
  }
}
