import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';

@ApiTags('Invoice')
@Controller('invoice')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  // ─── Create ──────────────────────────────────────────────────────────────

  @Post()
  @ApiOperation({ summary: 'Create a new invoice manually' })
  @ApiBody({ type: CreateInvoiceDto })
  @HttpCode(HttpStatus.CREATED)
  async createInvoice(@Body() dto: CreateInvoiceDto) {
    const result = await this.invoiceService.createInvoice(dto);
    return { message: 'Invoice created successfully', data: result };
  }

  @Post('from-quote/:quoteId')
  @ApiOperation({ summary: 'Auto-generate an invoice from an existing quote' })
  @HttpCode(HttpStatus.CREATED)
  async createFromQuote(@Param('quoteId') quoteId: string) {
    const result = await this.invoiceService.createFromQuote(quoteId);
    return { message: 'Invoice generated from quote', data: result };
  }

  // ─── List ────────────────────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'Get all invoices with pagination' })
  @ApiQuery({ name: 'searchTerm', required: false, type: String })
  @ApiQuery({ name: 'limit',      required: false, type: Number })
  @ApiQuery({ name: 'page',       required: false, type: Number })
  @HttpCode(HttpStatus.OK)
  async getAllInvoices(
    @Query('searchTerm') searchTerm?: string,
    @Query('limit')      limit?: number,
    @Query('page')       page?: number,
  ) {
    const filters = searchTerm ? { searchTerm } : {};
    const result  = await this.invoiceService.getAllInvoices(filters, { limit, page });
    return { message: 'Invoices fetched successfully', data: result };
  }

  // ─── Download (must be before :id route) ────────────────────────────────

  @Get(':id/download')
  @ApiOperation({ summary: 'Download invoice as PDF' })
  async downloadInvoice(@Param('id') id: string, @Res() res: Response) {
    const pdfBuffer = await this.invoiceService.downloadInvoice(id);

    res.set({
      'Content-Type':        'application/pdf',
      'Content-Disposition': `attachment; filename="invoice-${id}.pdf"`,
      'Content-Length':      pdfBuffer.length,
    });

    res.end(pdfBuffer);
  }

  // ─── Email ───────────────────────────────────────────────────────────────

  @Post(':id/email')
  @ApiOperation({ summary: 'Send invoice via email to the customer' })
  @HttpCode(HttpStatus.OK)
  async emailInvoice(@Param('id') id: string) {
    const result = await this.invoiceService.emailInvoice(id);
    return { message: result.message, data: { sentTo: result.sentTo } };
  }

  // ─── Single ──────────────────────────────────────────────────────────────

  @Get(':id')
  @ApiOperation({ summary: 'Get a single invoice' })
  @HttpCode(HttpStatus.OK)
  async getSingleInvoice(@Param('id') id: string) {
    const result = await this.invoiceService.getSingleInvoice(id);
    return { message: 'Invoice fetched successfully', data: result };
  }

  // ─── Update ──────────────────────────────────────────────────────────────

  // @Patch(':id')
  // @ApiOperation({ summary: 'Update an invoice' })
  // @ApiBody({ type: UpdateInvoiceDto })
  // @HttpCode(HttpStatus.OK)
  // async updateInvoice(@Param('id') id: string, @Body() dto: UpdateInvoiceDto) {
  //   const result = await this.invoiceService.updateInvoice(id, dto);
  //   return { message: 'Invoice updated successfully', data: result };
  // }

  // ─── Delete ──────────────────────────────────────────────────────────────

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an invoice' })
  @HttpCode(HttpStatus.OK)
  async deleteInvoice(@Param('id') id: string) {
    return this.invoiceService.deleteInvoice(id);
  }
}
