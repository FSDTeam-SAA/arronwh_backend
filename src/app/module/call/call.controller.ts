import { Body, Controller, Get, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CallService } from './call.service';
import {
  CallRecordingCallbackDto,
  CallStatusCallbackDto,
  MakeCallDto,
} from './dto/create.dto';
import { CallLogDocument } from './entities/call.entities';

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

  @Post('status')
  @ApiOperation({ summary: 'Receive Twilio call status webhook' })
  @ApiBody({ type: CallStatusCallbackDto })
  @ApiResponse({ status: 201, description: 'Call status received successfully' })
  async handleStatusCallback(
    @Body() callbackDto: CallStatusCallbackDto,
  ): Promise<{ success: boolean; data: CallLogDocument | null }> {
    const data = await this.callService.handleStatusCallback(callbackDto);
    return { success: true, data };
  }

  @Post('recording')
  @ApiOperation({ summary: 'Receive Twilio call recording webhook' })
  @ApiBody({ type: CallRecordingCallbackDto })
  @ApiResponse({ status: 201, description: 'Call recording received successfully' })
  async handleRecordingCallback(
    @Body() callbackDto: CallRecordingCallbackDto,
  ): Promise<{ success: boolean; data: CallLogDocument | null }> {
    const data = await this.callService.handleRecordingCallback(callbackDto);
    return { success: true, data };
  }
}
