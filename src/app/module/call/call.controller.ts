import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import type { Response } from 'express';
import { CallService } from './call.service';
import {
  CallRecordingCallbackDto,
  CallStatusCallbackDto,
  IncomingCallWebhookDto,
  MakeCallDto,
} from './dto/create.dto';
import { CallLogDocument } from './entities/call.entities';
import { Throttle } from '@nestjs/throttler';

@ApiTags('call')
@Controller('call')
export class CallController {
  constructor(private readonly callService: CallService) {}

  @Post()
  @ApiOperation({ summary: 'Make an outbound phone call' })
  @ApiBody({ type: MakeCallDto })
  @ApiResponse({ status: 201, description: 'Call initiated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid call payload' })
  @ApiResponse({ status: 500, description: 'Failed to initiate call' })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 calls per minute
  async makeCall(
    @Body() makeCallDto: MakeCallDto,
  ): Promise<{ success: boolean; data: CallLogDocument }> {
    const data = await this.callService.makeCall(makeCallDto);
    return { success: true, data };
  }

  @Get('logs')
  @ApiOperation({ summary: 'Get all call logs' })
  @ApiResponse({ status: 200, description: 'Call logs retrieved successfully' })
  async getCallLogs(): Promise<{ success: boolean; data: CallLogDocument[] }> {
    const data = await this.callService.getCallLogs();
    return { success: true, data };
  }

  @Post('incoming')
  @HttpCode(200)
  @ApiOperation({ summary: 'Twilio incoming call webhook for AI voice calls' })
  @ApiResponse({ status: 200, description: 'TwiML returned successfully' })
  async handleIncomingCall(
    @Req() req: Request,
    @Body() callbackDto: IncomingCallWebhookDto,
    @Res() res: Response,
  ) {
    this.callService.validateTwilioWebhook(req);
    await this.callService.handleIncomingCall(callbackDto);

    const twiml = this.callService.buildIncomingAiVoiceTwiml(
      callbackDto.message,
      req,
    );
    res.type('text/xml').send(twiml);
  }

  @Post('status')
  @HttpCode(200)
  @ApiOperation({ summary: 'Receive Twilio call status webhook' })
  @ApiBody({ type: CallStatusCallbackDto })
  @ApiResponse({ status: 200, description: 'Call status received successfully' })
  async handleStatusCallback(
    @Req() req: Request,
    @Body() callbackDto: CallStatusCallbackDto,
  ): Promise<{ success: boolean; data: CallLogDocument | null }> {
    this.callService.validateTwilioWebhook(req);
    const data = await this.callService.handleStatusCallback(callbackDto);
    return { success: true, data };
  }

  @Post('recording')
  @HttpCode(200)
  @ApiOperation({ summary: 'Receive Twilio call recording webhook' })
  @ApiBody({ type: CallRecordingCallbackDto })
  @ApiResponse({ status: 200, description: 'Call recording received successfully' })
  async handleRecordingCallback(
    @Req() req: Request,
    @Body() callbackDto: CallRecordingCallbackDto,
  ): Promise<{ success: boolean; data: CallLogDocument | null }> {
    this.callService.validateTwilioWebhook(req);
    const data = await this.callService.handleRecordingCallback(callbackDto);
    return { success: true, data };
  }
}
