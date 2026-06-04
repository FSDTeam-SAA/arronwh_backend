import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import twilio = require('twilio');
import { Model } from 'mongoose';
import { SmsLog, SmsLogDocument, SmsStatus } from './entities/sms.entities';
import { SendSmsDto } from './dto/create.dto';

type TwilioMessageStatusPayload = {
  MessageSid?: string;
  SmsSid?: string;
  MessageStatus?: string;
  SmsStatus?: string;
  ErrorCode?: string;
  ErrorMessage?: string;
  To?: string;
  From?: string;
};

@Injectable()
export class SmsService {
  private readonly client: twilio.Twilio;
  private readonly fromNumber: string;
  private readonly statusCallbackUrl?: string;
  private readonly logger = new Logger(SmsService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(SmsLog.name)
    private readonly smsLogModel: Model<SmsLogDocument>,
  ) {
    const accountSid = this.configService.getOrThrow<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.getOrThrow<string>('TWILIO_AUTH_TOKEN');
    this.fromNumber = this.configService.getOrThrow<string>('TWILIO_PHONE_NUMBER');
    this.statusCallbackUrl = this.buildStatusCallbackUrl();
    this.client = twilio(accountSid, authToken);
  }

  async sendSms(sendSmsDto: SendSmsDto): Promise<SmsLogDocument> {
    const { to, message } = sendSmsDto;
    const log = new this.smsLogModel({
      from: this.fromNumber,
      to,
      message,
      status: SmsStatus.QUEUED,
    });

    try {
      const response = await this.client.messages.create({
        from: this.fromNumber,
        to,
        body: message,
        ...(this.statusCallbackUrl
          ? { statusCallback: this.statusCallbackUrl }
          : {}),
      });

      log.twilioSid = response.sid;
      log.status = this.toSmsStatus(response.status);
      if (response.errorCode) {
        log.errorCode = String(response.errorCode);
      }
      if (response.errorMessage) {
        log.errorMessage = response.errorMessage;
      }
      if ([SmsStatus.SENT, SmsStatus.DELIVERED].includes(log.status)) {
        log.sentAt = new Date();
      }
      this.logger.log(`SMS accepted by Twilio for ${to} | SID: ${response.sid}`);
    } catch (error) {
      log.status = SmsStatus.FAILED;
      log.errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to send SMS to ${to}`, error);
      await log.save();
      throw new InternalServerErrorException('Failed to send SMS');
    }

    return log.save();
  }

  async getSmsLogs(): Promise<SmsLogDocument[]> {
    return this.smsLogModel.find().sort({ createdAt: 'desc' });
  }

  async updateSmsStatus(
    payload: TwilioMessageStatusPayload,
  ): Promise<SmsLogDocument | null> {
    const twilioSid = payload.MessageSid || payload.SmsSid;
    const twilioStatus = payload.MessageStatus || payload.SmsStatus;

    if (!twilioSid || !twilioStatus) {
      this.logger.warn('Received Twilio SMS status callback without SID or status');
      return null;
    }

    const status = this.toSmsStatus(twilioStatus);
    const update: Partial<SmsLog> = {
      status,
      errorCode: payload.ErrorCode,
      errorMessage: payload.ErrorMessage,
    };

    if (status === SmsStatus.SENT) {
      update.sentAt = new Date();
    }

    if (status === SmsStatus.DELIVERED) {
      update.deliveredAt = new Date();
      update.sentAt = new Date();
    }

    const log = await this.smsLogModel.findOneAndUpdate(
      { twilioSid },
      { $set: update },
      { new: true },
    );

    if (!log) {
      this.logger.warn(`SMS status callback received for unknown SID: ${twilioSid}`);
      return null;
    }

    this.logger.log(`SMS ${twilioSid} status updated to ${status}`);
    return log;
  }

  private buildStatusCallbackUrl(): string | undefined {
    const baseUrl = this.configService
      .get<string>('TWILIO_WEBHOOK_BASE_URL')
      ?.trim()
      .replace(/\/$/, '');

    if (!baseUrl) {
      return undefined;
    }

    return `${baseUrl}/api/v1/sms/status`;
  }

  private toSmsStatus(status?: string | null): SmsStatus {
    switch (status?.toLowerCase()) {
      case SmsStatus.ACCEPTED:
        return SmsStatus.ACCEPTED;
      case SmsStatus.QUEUED:
        return SmsStatus.QUEUED;
      case SmsStatus.SENDING:
        return SmsStatus.SENDING;
      case SmsStatus.SENT:
        return SmsStatus.SENT;
      case SmsStatus.DELIVERED:
        return SmsStatus.DELIVERED;
      case SmsStatus.UNDELIVERED:
        return SmsStatus.UNDELIVERED;
      case SmsStatus.FAILED:
        return SmsStatus.FAILED;
      default:
        return SmsStatus.QUEUED;
    }
  }
}
