import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
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
        twiml: this.buildVoiceTwiml(message, recordingCallbackUrl),
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

  private buildVoiceTwiml(message: string, recordingCallbackUrl: string): string {
    const voiceResponse = new twilio.twiml.VoiceResponse();
    voiceResponse.say({ voice: 'alice' }, message);
    voiceResponse.say(
      { voice: 'alice' },
      'Please say your answer after the beep. Press any key when you are finished.',
    );
    voiceResponse.record({
      action: recordingCallbackUrl,
      finishOnKey: '1234567890*#',
      maxLength: 60,
      method: 'POST',
      playBeep: true,
      recordingStatusCallback: recordingCallbackUrl,
      recordingStatusCallbackMethod: 'POST',
      timeout: 5,
      trim: 'trim-silence',
    });
    voiceResponse.say({ voice: 'alice' }, 'Thank you. Goodbye.');
    return voiceResponse.toString();
  }

  private normalizeCallStatus(status: string): CallStatus {
    const allowedStatuses = Object.values(CallStatus);

    if (allowedStatuses.includes(status as CallStatus)) {
      return status as CallStatus;
    }

    return CallStatus.IN_PROGRESS;
  }
}
