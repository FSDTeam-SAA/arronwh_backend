import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import twilio = require('twilio');
import { Model } from 'mongoose';
import { SmsLog, SmsLogDocument, SmsStatus } from './entities/sms.entities';
import { SendSmsDto } from './dto/create.dto';

@Injectable()
export class SmsService {
  private readonly client: twilio.Twilio;
  private readonly fromNumber: string;
  private readonly logger = new Logger(SmsService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(SmsLog.name)
    private readonly smsLogModel: Model<SmsLogDocument>,
  ) {
    const accountSid = this.configService.getOrThrow<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.getOrThrow<string>('TWILIO_AUTH_TOKEN');
    this.fromNumber = this.configService.getOrThrow<string>('TWILIO_PHONE_NUMBER');
    this.client = twilio(accountSid, authToken);
  }

  async sendSms(sendSmsDto: SendSmsDto): Promise<SmsLogDocument> {
    const { to, message } = sendSmsDto;
    const log = new this.smsLogModel({ to, message });

    try {
      const response = await this.client.messages.create({
        from: this.fromNumber,
        to,
        body: message,
      });

      log.twilioSid = response.sid;
      log.status = SmsStatus.SENT;
      this.logger.log(`SMS sent to ${to} | SID: ${response.sid}`);
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
}
