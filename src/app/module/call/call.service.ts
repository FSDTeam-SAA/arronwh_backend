import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import twilio = require('twilio');
import {
  CallRecordingCallbackDto,
  CallStatusCallbackDto,
  MakeCallDto,
} from './dto/create.dto';
import { CallLog, CallLogDocument, CallStatus } from './entities/call.entities';

@Injectable()
export class CallService {
  private readonly client: twilio.Twilio;
  private readonly fromNumber: string;
  private readonly logger = new Logger(CallService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(CallLog.name)
    private readonly callLogModel: Model<CallLogDocument>,
  ) {
    const accountSid = this.configService.getOrThrow<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.getOrThrow<string>('TWILIO_AUTH_TOKEN');
    this.fromNumber = this.configService.getOrThrow<string>('TWILIO_PHONE_NUMBER');
    this.client = twilio(accountSid, authToken);
  }

  async makeCall(makeCallDto: MakeCallDto): Promise<CallLogDocument> {
    const { to, message, recordingCallbackUrl, statusCallbackUrl } = makeCallDto;
    const log = new this.callLogModel({
      to,
      message,
      recordingCallbackUrl,
      statusCallbackUrl,
    });

    try {
      const response = await this.client.calls.create({
        from: this.fromNumber,
        to,
        twiml: this.buildAiVoiceTwiml(message),
        ...(statusCallbackUrl && {
          statusCallback: statusCallbackUrl,
          statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
          statusCallbackMethod: 'POST',
        }),
      });

      log.twilioCallSid = response.sid;
      log.status = CallStatus.INITIATED;
      this.logger.log(`Call initiated to ${to} | SID: ${response.sid}`);
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
      },
      { returnDocument: 'after' },
    );

    if (!updatedLog) {
      this.logger.warn(`Recording received for unknown SID: ${callbackDto.CallSid}`);
    }

    return updatedLog;
  }

  buildIncomingAiVoiceTwiml(message = 'Hello, you are connected with YOLO HEAT. How can I help you today?'): string {
    return this.buildAiVoiceTwiml(message);
  }

  private buildAiVoiceTwiml(message: string): string {
    const streamUrl = this.getAiStreamUrl();
    const voiceResponse = new twilio.twiml.VoiceResponse();

    if (message) {
      voiceResponse.say({ voice: 'alice' }, message);
    }

    const connect = voiceResponse.connect();
    connect.stream({
      url: streamUrl,
    });

    return voiceResponse.toString();
  }

  private getAiStreamUrl(): string {
    const explicitStreamUrl = this.configService.get<string>(
      'TWILIO_AI_STREAM_URL',
    );

    if (explicitStreamUrl) {
      return explicitStreamUrl;
    }

    const webhookBaseUrl = this.configService.get<string>(
      'TWILIO_WEBHOOK_BASE_URL',
    );

    if (!webhookBaseUrl) {
      throw new BadRequestException(
        'TWILIO_WEBHOOK_BASE_URL or TWILIO_AI_STREAM_URL is required for AI voice calls',
      );
    }

    const baseUrl = webhookBaseUrl.replace(/\/$/, '');
    const wsBaseUrl = baseUrl
      .replace(/^https:\/\//, 'wss://')
      .replace(/^http:\/\//, 'ws://');

    return `${wsBaseUrl}/api/v1/call/ai-stream`;
  }

  private normalizeCallStatus(status: string): CallStatus {
    const allowedStatuses = Object.values(CallStatus);

    if (allowedStatuses.includes(status as CallStatus)) {
      return status as CallStatus;
    }

    return CallStatus.IN_PROGRESS;
  }
}
