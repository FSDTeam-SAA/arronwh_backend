import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const twilio = require('twilio');
import { Twilio } from 'twilio'; // only for type, not construction

@Injectable()
export class TwilioService {
  private client: Twilio;
  private readonly logger = new Logger(TwilioService.name);

  constructor(private configService: ConfigService) {
    this.client = twilio(
      this.configService.get<string>('TWILIO_ACCOUNT_SID')!,
      this.configService.get<string>('TWILIO_AUTH_TOKEN')!,
    ) as Twilio;
  }

  async sendOtp(phoneNumber: string): Promise<boolean> {
    try {
      const verification = await this.client.verify.v2
        .services(this.configService.get<string>('TWILIO_VERIFY_SERVICE_SID')!)
        .verifications.create({
          to: phoneNumber,
          channel: 'sms',
        });

      this.logger.log(`OTP sent. Status: ${verification.status}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send OTP: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  async verifyOtp(phoneNumber: string, code: string): Promise<boolean> {
    try {
      const result = await this.client.verify.v2
        .services(this.configService.get<string>('TWILIO_VERIFY_SERVICE_SID')!)
        .verificationChecks.create({
          to: phoneNumber,
          code: code,
        });

      return result.status === 'approved';
    } catch (error) {
      this.logger.error(`OTP verification failed: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }
}