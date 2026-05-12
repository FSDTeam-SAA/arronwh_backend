import {
  BadRequestException,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as puppeteer from 'puppeteer';

import { Invoice, InvoiceDocument } from './entities/invoice.entity';
import { Quote, QuoteDocument } from '../quote/entities/quote.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import sendMailer from 'src/app/helpers/sendMailer';
import paginationHelper, { IOptions } from 'src/app/helpers/pagenation';
import { IFilterParams } from 'src/app/helpers/pick';
import buildWhereConditions from 'src/app/helpers/buildWhereConditions';
import { invoiceHtmlTemplate } from 'src/app/helpers/invoice-html.template';
import { invoiceEmailWrapper } from 'src/app/helpers/invoice-email.template';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectModel(Invoice.name)
    private readonly invoiceModel: Model<InvoiceDocument>,

    @InjectModel(Quote.name)
    private readonly quoteModel: Model<QuoteDocument>,
  ) {}

  // ─── Helpers ───────────────────────────────────────────────────────────────

  /** Compute subtotal, VAT and total from line-item arrays */
  private computeTotals(
    boilers: { price: number; qty?: number; discount?: number }[],
    controllers: { price: number; qty?: number; discount?: number }[],
    extras: { price: number; qty?: number; discount?: number }[],
    vatRate: number,
  ) {
    const lineTotal = (items: { price: number; qty?: number; discount?: number }[]) =>
      items.reduce((acc, i) => acc + i.price * (i.qty ?? 1) - (i.discount ?? 0), 0);

    const totalDiscount = [...boilers, ...controllers, ...extras]
      .reduce((acc, i) => acc + (i.discount ?? 0), 0);

    const subtotal  = lineTotal(boilers) + lineTotal(controllers) + lineTotal(extras);
    const vatAmount = parseFloat(((subtotal * vatRate) / 100).toFixed(2));
    const total     = parseFloat((subtotal + vatAmount).toFixed(2));

    return { subtotal, vatAmount, total, totalDiscount };
  }

  /** Render the invoice as an HTML string */
  private buildHtml(invoice: InvoiceDocument | any): string {
    return invoiceHtmlTemplate({
      invoiceNumber: invoice.invoiceNumber,
      status:        invoice.status,
      customerInfo:  invoice.customerInfo,
      boilers:       invoice.boilers ?? [],
      controllers:   invoice.controllers ?? [],
      extras:        invoice.extras ?? [],
      subtotal:      invoice.subtotal,
      vatRate:       invoice.vatRate,
      vatAmount:     invoice.vatAmount,
      totalDiscount: invoice.totalDiscount ?? 0,
      total:         invoice.total,
      dueDate:       invoice.dueDate,
      deliveryDate:  invoice.deliveryDate,
      notes:         invoice.notes,
      createdAt:     invoice.createdAt,
    });
  }

  /** Convert HTML to a PDF buffer using Puppeteer */
  private async htmlToPdf(html: string): Promise<Buffer> {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page    = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf     = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();
    return Buffer.from(pdf);
  }

  // ─── CRUD ──────────────────────────────────────────────────────────────────

  async createInvoice(dto: CreateInvoiceDto): Promise<InvoiceDocument> {
    const {
      boilers     = [],
      controllers = [],
      extras      = [],
      vatRate     = 20,
      quoteId,
      ...rest
    } = dto;

    // Optional: if quoteId supplied, validate it exists
    if (quoteId) {
      const exists = await this.quoteModel.findById(quoteId).lean();
      if (!exists) {
        throw new BadRequestException(`Quote with id ${quoteId} not found.`);
      }
    }

    const { subtotal, vatAmount, total, totalDiscount } = this.computeTotals(
      boilers, controllers, extras, vatRate,
    );

    const invoice = new this.invoiceModel({
      ...rest,
      quoteId: quoteId ?? undefined,
      boilers,
      controllers,
      extras,
      vatRate,
      subtotal,
      vatAmount,
      totalDiscount,
      total,
    });

    return invoice.save();
  }

  /**
   * Build an Invoice directly from a Quote document.
   * Useful when a quote is accepted and needs to be converted automatically.
   */
  async createFromQuote(quoteId: string): Promise<InvoiceDocument> {
    const quote = await this.quoteModel
      .findById(quoteId)
      .populate<{ productId: any }>('productId', 'title payablePrice')
      .populate<{ controller: any }>('controller', 'title price')
      .populate<{ extra: any }>('extra', 'title price')
      .lean();

    if (!quote) throw new BadRequestException(`Quote ${quoteId} not found.`);

    const boilers: any[]     = quote.productId
      ? [{ label: quote.productId.title, price: quote.productId.payablePrice ?? 0 }]
      : [];
    const controllers: any[] = quote.controller
      ? [{ label: quote.controller.title, price: quote.controller.price ?? 0 }]
      : [];
    const extras: any[]      = quote.extra
      ? [{ label: quote.extra.title, price: quote.extra.price ?? 0 }]
      : [];

    const { subtotal, vatAmount, total } = this.computeTotals(
      boilers, controllers, extras, 20,
    );

    const invoice = new this.invoiceModel({
      quoteId: quote._id,
      customerInfo: {
        name:    `${quote.personalInfo?.fastName ?? ''} ${quote.personalInfo?.sureName ?? ''}`.trim(),
        email:   quote.personalInfo?.email ?? '',
        phone:   quote.personalInfo?.mobleNumber,
        postcode: quote.personalInfo?.postcode,
      },
      boilers,
      controllers,
      extras,
      vatRate:   20,
      subtotal,
      vatAmount,
      total,
      status:    'pending',
    });

    return invoice.save();
  }

  async getAllInvoices(params: IFilterParams, options: IOptions) {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper(options);
    const where = buildWhereConditions(params, ['customerInfo', 'invoiceNumber']);

    const [data, total] = await Promise.all([
      this.invoiceModel
        .find(where)
        .sort({ [sortBy]: sortOrder } as any)
        .skip(skip)
        .limit(limit)
        .populate('quoteId', 'personalInfo'),
      this.invoiceModel.countDocuments(where),
    ]);

    return { data, total, page, limit };
  }

  async getSingleInvoice(id: string): Promise<InvoiceDocument> {
    const invoice = await this.invoiceModel
      .findById(id)
      .populate('quoteId', 'personalInfo');

    if (!invoice) throw new BadRequestException(`Invoice ${id} not found.`);
    return invoice;
  }

  // async updateInvoice(id: string, dto: UpdateInvoiceDto): Promise<InvoiceDocument> {
  //   const invoice = await this.invoiceModel.findById(id);
  //   if (!invoice) throw new BadRequestException(`Invoice ${id} not found.`);

  //   // Recompute totals if line items changed
  //   const boilers     = dto.boilers     ?? invoice.boilers;
  //   const controllers = dto.controllers ?? invoice.controllers;
  //   const extras      = dto.extras      ?? invoice.extras;
  //   const vatRate     = dto.vatRate     ?? invoice.vatRate;

  //   const { subtotal, vatAmount, total, totalDiscount } = this.computeTotals(
  //     boilers, controllers, extras, vatRate,
  //   );

  //   return this.invoiceModel.findByIdAndUpdate(
  //     id,
  //     { ...dto, boilers, controllers, extras, vatRate, subtotal, vatAmount, totalDiscount, total },
  //     { new: true },
  //   );
  // }

  async deleteInvoice(id: string) {
    const invoice = await this.invoiceModel.findById(id);
    if (!invoice) throw new BadRequestException(`Invoice ${id} not found.`);
    await this.invoiceModel.findByIdAndDelete(id);
    return { message: `Invoice ${id} deleted successfully.` };
  }

  // ─── PDF download ─────────────────────────────────────────────────────────

  async downloadInvoice(id: string): Promise<Buffer> {
    const invoice = await this.getSingleInvoice(id);
    const html    = this.buildHtml(invoice);
    return this.htmlToPdf(html);
  }

  // ─── Email ────────────────────────────────────────────────────────────────

  async emailInvoice(id: string): Promise<{ message: string; sentTo: string }> {
    const invoice = await this.getSingleInvoice(id);

    const email = invoice.customerInfo?.email;
    if (!email) throw new HttpException('No email address on this invoice.', 400);

    const invoiceHtml = this.buildHtml(invoice);
    const emailHtml   = invoiceEmailWrapper(invoiceHtml, invoice.invoiceNumber);

    await sendMailer(email, `Your Invoice ${invoice.invoiceNumber} – Yolo Heat`, emailHtml);

    // Track when it was emailed
    await this.invoiceModel.findByIdAndUpdate(id, { emailedAt: new Date() });

    return { message: 'Invoice emailed successfully.', sentTo: email };
  }
}
