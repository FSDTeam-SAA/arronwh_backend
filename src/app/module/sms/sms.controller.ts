import { Body, Controller, Get, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SmsService } from './sms.service';
import { SendSmsDto } from './dto/create.dto';
import { SmsLogDocument } from './entities/sms.entities';


@ApiTags('sms')
@Controller('sms')
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @Post('send')
  @ApiOperation({ summary: 'Send an SMS message' })
  @ApiBody({ type: SendSmsDto })
  @ApiResponse({ status: 201, description: 'SMS sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid SMS payload' })
  @ApiResponse({ status: 500, description: 'Failed to send SMS' })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async sendSms(@Body() sendSmsDto: SendSmsDto): Promise<{ success: boolean; data: SmsLogDocument }> {
    const data = await this.smsService.sendSms(sendSmsDto);
    return { success: true, data };
  }

  @Get('logs')
  @ApiOperation({ summary: 'Get all SMS logs' })
  @ApiResponse({ status: 200, description: 'SMS logs retrieved successfully' })
  async getSmsLogs(): Promise<{ success: boolean; data: SmsLogDocument[] }> {
    const data = await this.smsService.getSmsLogs();
    return { success: true, data };
  }
}
