import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TwilioService } from './twilio.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import AuthGuard from 'src/app/middlewares/auth.guard';
import { UseGuards } from '@nestjs/common';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@ApiTags('twilio')
@Controller('twilio')
export class TwilioController {
  constructor(private readonly twilioService: TwilioService) {}

  @Post('send-otp')
  @ApiOperation({ summary: 'Send OTP to a phone number' })
  @ApiBody({
    schema: {
      properties: {
        phone: {
          type: 'string',
          example: '+447911123456',
          description: 'Phone number in E.164 format',
        },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async sendOtp(@Body() body: SendOtpDto) {
    const result = await this.twilioService.sendOtp(body.phone);
    return {
      message: result ? 'OTP sent successfully' : 'Failed to send OTP',
      success: result,
    };
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify OTP code entered by user' })
  @ApiBody({
    schema: {
      properties: {
        phone: {
          type: 'string',
          example: '+447911123456',
        },
        code: {
          type: 'string',
          example: '123456',
        },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() body: VerifyOtpDto) {
    const isValid = await this.twilioService.verifyOtp(body.phone, body.code);
    return {
      message: isValid ? 'OTP verified successfully' : 'Invalid or expired OTP',
      success: isValid,
    };
  }
}