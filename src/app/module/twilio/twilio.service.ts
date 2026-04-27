// // twilio/twilio.service.ts
// import { HttpException, Injectable, Logger } from '@nestjs/common';
// import Twilio = require('twilio');
// import config from 'src/app/config';

// @Injectable()
// export class TwilioService {
//   private readonly client?: Twilio.Twilio;
//   private readonly from?: string;
//   private readonly logger = new Logger(TwilioService.name);

//   constructor() {
//     const accountSid = config.twilio.accountSid;
//     const authToken = config.twilio.authToken;
//     this.from = config.twilio.phoneNumber;

//     if (accountSid && authToken && this.from) {
//       this.client = Twilio(accountSid, authToken);
//     }
//   }

//   async makeCall(to: string, webhookBaseUrl: string) {
//     try {
//       if (!this.client || !this.from) {
//         throw new HttpException('Twilio configuration missing', 500);
//       }

//       const call = await this.client.calls.create({
//         to,
//         from: this.from,
//         url: `${webhookBaseUrl}/calls/twiml`,
//         statusCallback: `${webhookBaseUrl}/calls/status`,
//         statusCallbackMethod: 'POST',
//       });

//       this.logger.log(`Call initiated — SID: ${call.sid} | To: ${to}`);
//       return {
//         sid: call.sid,
//         status: call.status,
//       };
//     } catch (error) {
//       this.logger.error(`Failed to initiate call to ${to}`, error);
//       throw new HttpException('Could not initiate call', 500);
//     }
//   }

//   async getCallStatus(callSid: string) {
//     try {
//       if (!this.client) {
//         throw new HttpException('Twilio configuration missing', 500);
//       }

//       const call = await this.client.calls(callSid).fetch();
//       if (!call) throw new HttpException('Call not found', 404);

//       return {
//         sid: call.sid,
//         to: call.to,
//         from: call.from,
//         status: call.status,
//         duration: call.duration,
//         startTime: call.startTime,
//         endTime: call.endTime,
//       };
//     } catch (error) {
//       if (error instanceof HttpException) throw error;
//       this.logger.error(`Failed to fetch call SID: ${callSid}`, error);
//       throw new HttpException('Could not fetch call details', 500);
//     }
//   }

//   async handleStatusCallback(body: any) {
//     this.logger.log(`Call ${body.CallSid} — Status: ${body.CallStatus}`);
//     return { received: true };
//   }

//   generateTwiml(): string {
//     const response = new Twilio.twiml.VoiceResponse();
//     response.say({ voice: 'alice', language: 'en-US' }, 'Hello! Your call has been connected.');
//     return response.toString();
//   }
// }

import { HttpException, Injectable, Logger } from '@nestjs/common';
import Twilio from 'twilio';
import config from 'src/app/config';

@Injectable()
export class TwilioService {
  private readonly client?: Twilio.Twilio;
  private readonly from?: string;
  private readonly logger = new Logger(TwilioService.name);
  private readonly webhookBaseUrl?: string;

  constructor() {
    const accountSid = config.twilio.accountSid;
    const authToken = config.twilio.authToken;
    this.from = config.twilio.phoneNumber;
    this.webhookBaseUrl = config.twilio.webhookBaseUrl;

    if (accountSid && authToken && this.from) {
      this.client = Twilio(accountSid, authToken);
    }
  }

  async makeCall(to: string) {
    try {
      if (!this.client || !this.from || !this.webhookBaseUrl) {
        throw new HttpException('Twilio configuration missing', 500);
      }

      const call = await this.client.calls.create({
        to,
        from: this.from,
        url: `${this.webhookBaseUrl}/calls/twiml`,
        statusCallback: `${this.webhookBaseUrl}/calls/status`,
        statusCallbackMethod: 'POST',
      });

      this.logger.log(`Call initiated — SID: ${call.sid} | To: ${to}`);

      return {
        sid: call.sid,
        status: call.status,
      };
    } catch (error: any) {
      this.logger.error(`Failed to initiate call to ${to}`, error);
      throw new HttpException(
        error?.message || 'Could not initiate call',
        error?.status || 500,
      );
    }
  }

  async getCallStatus(callSid: string) {
    try {
      if (!this.client) {
        throw new HttpException('Twilio configuration missing', 500);
      }

      const call = await this.client.calls(callSid).fetch();

      return {
        sid: call.sid,
        to: call.to,
        from: call.from,
        status: call.status,
        duration: call.duration,
        startTime: call.startTime,
        endTime: call.endTime,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Failed to fetch call SID: ${callSid}`, error);
      throw new HttpException('Could not fetch call details', 500);
    }
  }

  async handleStatusCallback(body: any) {
    this.logger.log(`Call ${body.CallSid} — Status: ${body.CallStatus}`);
    return { received: true };
  }

  generateTwiml(): string {
    const response = new Twilio.twiml.VoiceResponse();
    response.say(
      { voice: 'alice', language: 'en-US' },
      'Hello! Your call has been connected.',
    );
    return response.toString();
  }
}
