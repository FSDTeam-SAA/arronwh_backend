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
import { User, UserDocument } from '../user/entities/user.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import sendMailer from 'src/app/helpers/sendMailer';
import paginationHelper, { IOptions } from 'src/app/helpers/pagenation';
import { IFilterParams } from 'src/app/helpers/pick';
import buildWhereConditions from 'src/app/helpers/buildWhereConditions';
import { invoiceHtmlTemplate } from 'src/app/helpers/invoice-html.template';
import { invoiceEmailWrapper } from 'src/app/helpers/invoice-email.template';

// ─── Typed item shapes matching the updated entity ───────────────────────────

interface BoilerItem   { name: string; numberOfBoiler: number;      price: number }
interface ControllerItem { name: string; numberOfControllers: number; price: number }
interface ExtraItem    { name: string; numberOfExtra: number;       price: number }

@Injectable()
export class InvoiceService {
  private readonly invoiceNumberRetryLimit = 5;

  constructor(
    @InjectModel(Invoice.name)
    private readonly invoiceModel: Model<InvoiceDocument>,

    @InjectModel(Quote.name)
    private readonly quoteModel: Model<QuoteDocument>,

    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  // ─── Helpers ───────────────────────────────────────────────────────────────

  /**
   * Compute subtotal, VAT and total from the three typed line-item arrays.
   * Each item's contribution = price × qty (numberOfBoiler / numberOfControllers / numberOfExtra).
   */
  private computeTotals(
    boilers:     BoilerItem[],
    controllers: ControllerItem[],
    extras:      ExtraItem[]
  ) {
    const boilerTotal     = boilers.reduce((s, i) => s + i.price * i.numberOfBoiler, 0);
    const controllerTotal = controllers.reduce((s, i) => s + i.price * i.numberOfControllers, 0);
    const extraTotal      = extras.reduce((s, i) => s + i.price * i.numberOfExtra, 0);

    const subtotal  = boilerTotal + controllerTotal + extraTotal;
    const total     = subtotal; // No discounts implemented yet

    return { subtotal, total };
  }

  /** Render the invoice as an HTML string */
  private buildHtml(invoice: InvoiceDocument | any): string {
    return invoiceHtmlTemplate({
      invoiceNumber: invoice.invoiceNumber,
      status:        invoice.status,
      customerInfo:  invoice.customerInfo,
      boilers:       invoice.boilers       ?? [],
      controllers:   invoice.controllers   ?? [],
      extras:        invoice.extras        ?? [],
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

  private isDuplicateInvoiceNumberError(error: any): boolean {
    return error?.code === 11000 && Boolean(error?.keyPattern?.invoiceNumber);
  }

  private async saveInvoiceWithUniqueNumber(invoice: InvoiceDocument): Promise<InvoiceDocument> {
    const shouldGenerateInvoiceNumber = !invoice.invoiceNumber;

    for (let attempt = 0; attempt < this.invoiceNumberRetryLimit; attempt += 1) {
      try {
        return await invoice.save();
      } catch (error) {
        if (!this.isDuplicateInvoiceNumberError(error) || !shouldGenerateInvoiceNumber) {
          throw error;
        }

        (invoice as any).invoiceNumber = undefined;
      }
    }

    throw new BadRequestException('Could not generate a unique invoice number. Please try again.');
  }

  private async upsertCustomerAsUser(customerInfo: CreateInvoiceDto['customerInfo']) {
    const email = customerInfo?.email?.trim().toLowerCase();
    if (!email) return;

    const userPayload: Partial<User> = {
      fullName: customerInfo.name?.trim() || email,
      email,
      phoneNumber: customerInfo.phone,
      address: customerInfo.address,
      postcode: customerInfo.postcode,
    };

    Object.keys(userPayload).forEach((key) => {
      if (userPayload[key as keyof User] === undefined || userPayload[key as keyof User] === '') {
        delete userPayload[key as keyof User];
      }
    });

    await this.userModel.updateOne(
      { email },
      {
        $set: userPayload,
        $setOnInsert: {
          role: 'user',
          status: 'active',
        },
      },
      { upsert: true },
    );
  }

  // ─── CRUD ──────────────────────────────────────────────────────────────────

  async createInvoice(dto: CreateInvoiceDto): Promise<InvoiceDocument> {
    const {
      boilers     = [],
      controllers = [],
      extras      = [],
      ...rest
    } = dto;

    // if (quoteId) {
    //   const exists = await this.quoteModel.findById(quoteId).lean();
    //   if (!exists) throw new BadRequestException(`Quote with id ${quoteId} not found.`);
    // }

    const { subtotal, total } = this.computeTotals(
      boilers     as BoilerItem[],
      controllers as ControllerItem[],
      extras      as ExtraItem[]
    );

    const invoice = new this.invoiceModel({
      ...rest,
      boilers,
      controllers,
      extras,
      subtotal,
      total,
    });

    const email = invoice.customerInfo?.email;
    const savedInvoice = await this.saveInvoiceWithUniqueNumber(invoice);
    await this.upsertCustomerAsUser(savedInvoice.customerInfo as CreateInvoiceDto['customerInfo']);

    const invoiceHtml = this.buildHtml(savedInvoice);
    const emailHtml   = invoiceEmailWrapper(invoiceHtml, savedInvoice.invoiceNumber);

    await sendMailer(email, `Your Invoice ${savedInvoice.invoiceNumber} – Yolo Heat`, emailHtml);

    return savedInvoice;
  }

  /**
   * Build an Invoice directly from a Quote document.
   * Uses the updated line-item shapes.
   */
  async createFromQuote(quoteId: string): Promise<InvoiceDocument> {
    const quote = await this.quoteModel
      .findById(quoteId)
      .populate<{ productId: any }>('productId', 'title payablePrice')
      .populate<{ controller: any }>('controller', 'title price')
      .populate<{ extra: any }>('extra', 'title price')
      .lean();

    if (!quote) throw new BadRequestException(`Quote ${quoteId} not found.`);

    const boilers: BoilerItem[] = quote.productId
      ? [{ name: quote.productId.title, numberOfBoiler: 1, price: quote.productId.payablePrice ?? 0 }]
      : [];

    const controllers: ControllerItem[] = quote.controller
      ? [{ name: quote.controller.title, numberOfControllers: 1, price: quote.controller.price ?? 0 }]
      : [];

    const extras: ExtraItem[] = quote.extra
      ? [{ name: quote.extra.title, numberOfExtra: 1, price: quote.extra.price ?? 0 }]
      : [];

    const { subtotal, total } = this.computeTotals(boilers, controllers, extras);

    const invoice = new this.invoiceModel({
      quoteId: quote._id,
      customerInfo: {
        name:     `${quote.personalInfo?.fastName ?? ''} ${quote.personalInfo?.sureName ?? ''}`.trim(),
        email:    quote.personalInfo?.email    ?? '',
        phone:    quote.personalInfo?.mobleNumber,
        postcode: quote.personalInfo?.postcode,
      },
      boilers,
      controllers,
      extras,
      vatRate: 20,
      subtotal,
      total,
      status: 'pending',
    });

    return this.saveInvoiceWithUniqueNumber(invoice);
  }

  async getAllInvoices(params: IFilterParams, options: IOptions) {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper(options);
    const where = buildWhereConditions(params, ['customerInfo', 'invoiceNumber']);

    const [data, total] = await Promise.all([
      this.invoiceModel
        .find(where)
        .sort({ [sortBy]: sortOrder } as any)
        .skip(skip)
        .limit(limit),
      this.invoiceModel.countDocuments(where),
    ]);

    return { data, total, page, limit };
  }

  async getSingleInvoice(id: string): Promise<InvoiceDocument> {
    const invoice = await this.invoiceModel
      .findById(id)
      .lean();

    if (!invoice) throw new BadRequestException(`Invoice ${id} not found.`);
    return invoice;
  }

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

    await this.invoiceModel.findByIdAndUpdate(id, { emailedAt: new Date() });

    return { message: 'Invoice emailed successfully.', sentTo: email };
  }
}
