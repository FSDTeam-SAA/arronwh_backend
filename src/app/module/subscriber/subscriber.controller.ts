import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Patch,
  UseInterceptors,
  HttpCode,
  HttpStatus,
  UseGuards,
  UploadedFile,
  Req,
  Query,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileUpload } from 'src/app/helpers/fileUploder';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import AuthGuard from 'src/app/middlewares/auth.guard';
import type { Request } from 'express';
import type { Response } from 'express';
import pick from 'src/app/helpers/pick';
import { SubscriberService } from './subscriber.sevice';
import { SendMessageDto } from './dto/send-message.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import { CallbackMessageDto } from './dto/callback.dto';
import { ManuallaySendEmailDto } from './dto/manuallay-send-email.dto';

@ApiTags('Subscriber')
@Controller('subscriber')
export class SubscriberController {
  constructor(private readonly subscriberService: SubscriberService) {}

  // ─── Sync unique quote users into subscriber list ────────────────────────
  @Post('sync-from-quotes')
  @ApiOperation({
    summary: 'Sync unique users from all Quotes into the Subscriber collection',
  })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  async syncFromQuotes() {
    const result = await this.subscriberService.syncSubscribersFromQuotes();
    return {
      message: 'Subscribers synced from quotes successfully',
      data: result,
    };
  }

  // ─── Send message to all active subscribers ──────────────────────────────
  @Post('send-message')
  @ApiOperation({
    summary:
      'Send a message with optional attachment to all active subscribers',
  })
  @ApiBearerAuth('access-token')
  @ApiConsumes('multipart/form-data')
  @UseGuards(AuthGuard('admin'))
  @UseInterceptors(FileInterceptor('attachment', fileUpload.uploadConfig))
  @ApiBody({
    schema: {
      type: 'object',
      required: ['subject', 'message'],
      properties: {
        subject: {
          type: 'string',
          example: 'Special offer from YOLO HEAT!',
        },
        message: {
          type: 'string',
          example: 'Hello subscribers, check out our new offer!',
        },
        attachment: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async sendMessage(
    @Body() sendMessageDto: SendMessageDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const result = await this.subscriberService.sendMessageToAll(
      sendMessageDto,
      file,
    );
    return {
      message: 'Message sent to all active subscribers',
      data: result,
    };
  }

  // ─── Get all subscribers ─────────────────────────────────────────────────
  @Post('callback')
  @ApiOperation({ summary: 'Send a callback request to the YOLO HEAT team' })
  @ApiBody({ type: CallbackMessageDto })
  @HttpCode(HttpStatus.OK)
  async sendCallbackMessage(@Body() callbackMessageDto: CallbackMessageDto) {
    const result =
      await this.subscriberService.sendCallbackMessage(callbackMessageDto);

    return {
      message: 'Callback request sent successfully',
      data: result,
    };
  }

  @Post('manuallay-send-email')
  @ApiOperation({
    summary:
      'Manually send a full quote email to the quote customer with custom description',
  })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @ApiBody({ type: ManuallaySendEmailDto })
  @HttpCode(HttpStatus.OK)
  async manuallaySendEmail(@Body() dto: ManuallaySendEmailDto) {
    const result = await this.subscriberService.manuallaySendEmail(dto);

    return {
      message: 'Manual quote email sent successfully',
      data: result,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all subscribers' })
  @ApiBearerAuth('access-token')
  @ApiQuery({ name: 'searchTerm', required: false, type: String, example: '' })
  @ApiQuery({ name: 'email', required: false, type: String, example: '' })
  @ApiQuery({ name: 'status', required: false, type: String, example: '' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    example: 'createdAt',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    example: 'desc',
  })
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  async getAllSubscribers(@Req() req: Request) {
    const params = pick(req.query, ['searchTerm', 'email', 'status']);
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result = await this.subscriberService.getAllSubscribers(
      params,
      options,
    );
    return {
      message: 'Subscribers fetched successfully',
      meta: result.meta,
      data: result.data,
    };
  }

  @Get('quote/:quoteId/invoice/download')
  @ApiOperation({ summary: 'Download quote sales invoice as PDF' })
  @ApiQuery({ name: 'price', required: false, type: Number })
  async downloadInvoicePdf(
    @Param('quoteId') quoteId: string,
    @Res() res: Response,
    @Query('price') price?: string,
  ) {
    const pdfBuffer = await this.subscriberService.generateInvoicePdf(
      quoteId,
      price,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice-${quoteId}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    res.end(pdfBuffer);
  }

  @Post('quote/:quoteId/invoice/email')
  @ApiOperation({ summary: 'Send quote sales invoice PDF to customer email' })
  @ApiQuery({ name: 'price', required: false, type: Number })
  @HttpCode(HttpStatus.OK)
  async sendInvoicePdfToQuoteCustomer(
    @Param('quoteId') quoteId: string,
    @Body('price') bodyPrice?: number | string,
    @Query('price') queryPrice?: string,
  ) {
    const result = await this.subscriberService.sendInvoicePdfToQuoteCustomer(
      quoteId,
      bodyPrice ?? queryPrice,
    );

    return {
      message: 'Invoice PDF email sent successfully',
      data: result,
    };
  }

  // ─── Get single subscriber ───────────────────────────────────────────────
  @Get(':id')
  @ApiOperation({ summary: 'Get single subscriber by id' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  async getSingleSubscriber(@Param('id') id: string) {
    const result = await this.subscriberService.getSingleSubscriber(id);
    return {
      message: 'Subscriber fetched successfully',
      data: result,
    };
  }

  // ─── Update subscriber ───────────────────────────────────────────────────
  @Put(':id')
  @ApiOperation({ summary: 'Update subscriber by id' })
  @ApiBearerAuth('access-token')
  @ApiConsumes('multipart/form-data')
  @UseGuards(AuthGuard('admin'))
  @UseInterceptors(FileInterceptor('attachment', fileUpload.uploadConfig))
  @ApiBody({ type: UpdateSubscriberDto })
  @HttpCode(HttpStatus.OK)
  async updateSubscriber(
    @Param('id') id: string,
    @Body() updateSubscriberDto: UpdateSubscriberDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const result = await this.subscriberService.updateSubscriber(
      id,
      updateSubscriberDto,
      file,
    );
    return {
      message: 'Subscriber updated successfully',
      data: result,
    };
  }

  // ─── Unsubscribe by email ────────────────────────────────────────────────
  @Patch('unsubscribe/:email')
  @ApiOperation({ summary: 'Unsubscribe by email' })
  @HttpCode(HttpStatus.OK)
  async unsubscribe(@Param('email') email: string) {
    const result = await this.subscriberService.unsubscribe(email);
    return {
      message: 'Unsubscribed successfully',
      data: result,
    };
  }

  // ─── Delete subscriber ───────────────────────────────────────────────────
  @Delete(':id')
  @ApiOperation({ summary: 'Delete subscriber by id' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  async deleteSubscriber(@Param('id') id: string) {
    const result = await this.subscriberService.deleteSubscriber(id);
    return {
      message: 'Subscriber deleted successfully',
      data: result,
    };
  }
}
