// twilio/twilio.controller.ts
import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Req,
  HttpCode,
  HttpStatus,
  Header,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { TwilioService } from './twilio.service';
import { MakeCallDto } from './dto/make-call.dto';
import AuthGuard from 'src/app/middlewares/auth.guard';

@ApiTags('calls')
@Controller('calls')
export class TwilioController {
  constructor(private readonly twilioService: TwilioService) {}

  // @Post('make')
  // @ApiOperation({ summary: 'Initiate an outbound call' })
  // // @ApiBearerAuth('access-token')
  // // @UseGuards(AuthGuard('admin'))
  // @ApiBody({ type: MakeCallDto })
  // @HttpCode(HttpStatus.OK)
  // async makeCall(@Body() body: MakeCallDto, @Req() req: Request) {
  //   const webhookBaseUrl = `${req.protocol}://${req.get('host')}`;
  //   const result = await this.twilioService.makeCall(body.to, webhookBaseUrl);
  //   return {
  //     message: 'Call initiated successfully',
  //     data: result,
  //   };
  // }
  @Post('make')
  @HttpCode(HttpStatus.OK)
  async makeCall(@Body() body: MakeCallDto) {
    const result = await this.twilioService.makeCall(body.to);
    return {
      message: 'Call initiated successfully',
      data: result,
    };
  }

  @Post('twiml')
  @ApiOperation({ summary: 'Twilio webhook for call instructions' })
  @HttpCode(200)
  @Header('Content-Type', 'text/xml')
  getTwiml(): string {
    return this.twilioService.generateTwiml();
  }

  @Post('status')
  @ApiOperation({ summary: 'Twilio webhook for call status updates' })
  @HttpCode(HttpStatus.OK)
  async handleStatusCallback(@Body() body: any) {
    const result = await this.twilioService.handleStatusCallback(body);
    return {
      message: 'Status received',
      data: result,
    };
  }

  @Get(':sid')
  @ApiOperation({ summary: 'Get call details by SID' })
  @ApiParam({
    name: 'sid',
    description: 'Twilio call SID',
    example: 'CA123456789',
  })
  // @ApiBearerAuth('access-token')
  // @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  async getCall(@Param('sid') sid: string) {
    const result = await this.twilioService.getCallStatus(sid);
    return {
      message: 'Call details retrieved successfully',
      data: result,
    };
  }
}
