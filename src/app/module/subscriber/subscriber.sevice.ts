import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subscriber, SubscriberDocument } from './entities/subscriber.entity';
import { Quote, QuoteDocument } from '../quote/entities/quote.entity';
import { User, UserDocument } from '../user/entities/user.entity';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { CallbackMessageDto } from './dto/callback.dto';
import { ManuallaySendEmailDto } from './dto/manuallay-send-email.dto';
import { fileUpload } from 'src/app/helpers/fileUploder';
import { IFilterParams } from 'src/app/helpers/pick';
import paginationHelper, { IOptions } from 'src/app/helpers/pagenation';
import buildWhereConditions from 'src/app/helpers/buildWhereConditions';
import sendMailer from 'src/app/helpers/sendMailer';
import { buildEmailHtml } from 'src/app/helpers/template';
import config from 'src/app/config';
import * as puppeteer from 'puppeteer';

const subscriberSearchAbleFields = ['email', 'firstName', 'status', 'postcode'];

@Injectable()
export class SubscriberService {
  constructor(
    @InjectModel(Subscriber.name)
    private readonly subscriberModel: Model<SubscriberDocument>,

    @InjectModel(Quote.name)
    private readonly quoteModel: Model<QuoteDocument>,

    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  private escapeHtml(value = '') {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private buildCallbackEmailHtml(callbackMessageDto: CallbackMessageDto) {
    const name = this.escapeHtml(callbackMessageDto.name);
    const reason = this.escapeHtml(callbackMessageDto.reason || 'Not provided');
    const phoneNumber = this.escapeHtml(
      callbackMessageDto.phoneNumber || 'Not provided',
    );
    const submitted = new Date().toLocaleString('en-GB', {
      timeZone: 'Europe/London',
    });

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>YOLO HEAT Callback Request</title>
        <style>
          body { margin: 0; padding: 0; background: #f3f5f8; font-family: Arial, sans-serif; }
          .wrapper { max-width: 620px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #dde5ee; box-shadow: 0 8px 24px rgba(17, 46, 82, 0.08); }
          .brand { background: #e8ff00; padding: 18px 28px; color: #102f52; font-size: 14px; font-weight: 800; letter-spacing: 4px; text-transform: uppercase; }
          .header { background: #dfe7ef; padding: 28px 32px; border-bottom: 4px solid #e8ff00; }
          .header h1 { color: #102f52; margin: 0; font-size: 28px; line-height: 1.2; font-weight: 800; }
          .header p { color: #354a60; margin: 10px 0 0; font-size: 15px; line-height: 1.6; }
          .body { padding: 28px 32px 32px; color: #102f52; }
          .summary { background: #f7f9fb; border: 1px solid #dde5ee; border-radius: 10px; overflow: hidden; }
          .row { border-bottom: 1px solid #dde5ee; padding: 16px 18px; }
          .row:last-child { border-bottom: none; }
          .label { color: #53677d; font-size: 12px; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.4px; }
          .value { color: #102f52; font-size: 16px; font-weight: 800; line-height: 1.4; }
          .phone { color: #00a879; }
          .footer { background: #102f52; padding: 18px 32px; text-align: center; font-size: 12px; color: #dfe7ef; }
          .footer strong { color: #e8ff00; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="brand">YOLO HEAT</div>
          <div class="header">
            <h1>New Callback Request</h1>
            <p>A customer submitted a callback request from the website.</p>
          </div>
          <div class="body">
            <div class="summary">
              <div class="row">
                <div class="label">Name</div>
                <div class="value">${name}</div>
              </div>
              <div class="row">
                <div class="label">Phone Number</div>
                <div class="value phone">${phoneNumber}</div>
              </div>
              <div class="row">
                <div class="label">Reason</div>
                <div class="value">${reason}</div>
              </div>
              <div class="row">
                <div class="label">Submitted</div>
                <div class="value">${submitted}</div>
              </div>
            </div>
          </div>
          <div class="footer">
            <p>Automated notification from <strong>YOLO HEAT</strong> website.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private parsePrice(price?: number | string): number | undefined {
    if (typeof price === 'number') {
      return Number.isFinite(price) ? price : undefined;
    }

    if (typeof price === 'string') {
      const cleaned = price.trim().replace(/[^0-9.-]/g, '');
      if (!cleaned) return undefined;

      const parsed = Number(cleaned);
      return Number.isFinite(parsed) ? parsed : undefined;
    }

    return undefined;
  }

  private money(value?: number) {
    return typeof value === 'number' && Number.isFinite(value)
      ? `&pound;${value.toLocaleString('en-GB', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : '&pound;0.00';
  }

  private formatInvoiceDate(date?: Date | string) {
    return date ? new Date(date).toLocaleDateString('en-GB') : 'N/A';
  }

  private getQuoteTotal(quote: any, price?: number | string) {
    const parsedPrice = this.parsePrice(price);
    if (typeof parsedPrice === 'number') return parsedPrice;

    const product = quote.productId ?? {};
    const controller = quote.controller ?? {};
    const extra = quote.extra ?? {};

    const subtotal =
      (product.payablePrice ?? product.price ?? 0) +
      (controller.price ?? 0) +
      (extra.price ?? 0);

    const coupon = quote.coupon ?? null;
    const discount =
      coupon?.type === 'percentage'
        ? Math.round((subtotal * coupon.value) / 100)
        : (coupon?.value ?? 0);

    return Math.max(subtotal - discount, 0);
  }

  private buildManuallaySendEmailHtml(description: string, quote: any) {
    const personal = quote.personalInfo ?? {};
    const product = quote.productId ?? {};
    const controller = quote.controller ?? {};
    const extra = quote.extra ?? {};
    const total = this.getQuoteTotal(quote);
    const customerName = this.escapeHtml(
      `${personal.title ?? ''} ${personal.fastName ?? ''} ${personal.sureName ?? ''}`.trim() ||
        'Customer',
    );
    const customerEmail = this.escapeHtml(personal.email ?? 'N/A');
    const customerPhone = this.escapeHtml(personal.mobleNumber ?? 'N/A');
    const customerPostcode = this.escapeHtml(personal.postcode ?? 'N/A');
    const productTitle = this.escapeHtml(product.title ?? 'Selected boiler');
    const controllerTitle = this.escapeHtml(controller.title ?? 'Not selected');
    const extraTitle = this.escapeHtml(extra.title ?? 'Not selected');
    const installAddress = this.escapeHtml(quote.installAddress ?? 'N/A');
    const quoteReference = this.escapeHtml(String(quote._id ?? 'N/A'));
    const safeDescription = this.escapeHtml(description).replace(/\n/g, '<br />');

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>YOLO HEAT Quote Details</title>
        <style>
          body { margin: 0; padding: 0; background: #EAEBEC; font-family: Arial, Helvetica, sans-serif; color: #1A2E1A; }
          .wrapper { max-width: 680px; margin: 32px auto; background: #ffffff; border: 1px solid #d6d8da; overflow: hidden; }
          .brand { background: #EAEBEC; padding: 24px 30px; }
          .logo { font-size: 24px; font-weight: 900; letter-spacing: -0.5px; color: #1A2E1A; }
          .company { margin-top: 8px; font-size: 12px; line-height: 1.6; color: #435343; }
          .hero { background: #FBFF26; padding: 28px 30px; }
          .hero h1 { margin: 0; font-size: 26px; line-height: 1.25; color: #1A2E1A; }
          .hero p { margin: 10px 0 0; font-size: 14px; line-height: 1.6; color: #263a26; }
          .body { padding: 28px 30px 32px; }
          .message { background: #D0E7D5; border: 1px solid #b9d2bf; padding: 18px; font-size: 15px; line-height: 1.7; color: #263a26; }
          .section { margin-top: 22px; }
          .section-title { margin: 0 0 10px; font-size: 15px; font-weight: 900; color: #1A2E1A; text-transform: uppercase; letter-spacing: .04em; }
          .table { width: 100%; border-collapse: collapse; border: 1px solid #e1e5e1; }
          .table td { padding: 12px 14px; border-bottom: 1px solid #e1e5e1; font-size: 14px; vertical-align: top; }
          .table tr:last-child td { border-bottom: none; }
          .label { width: 38%; color: #617064; font-weight: 700; }
          .value { color: #1A2E1A; font-weight: 700; text-align: right; }
          .total { margin-top: 22px; background: #1A2E1A; color: #ffffff; padding: 18px; text-align: right; }
          .total span { display: block; font-size: 12px; color: #D0E7D5; text-transform: uppercase; letter-spacing: .06em; }
          .total strong { display: block; margin-top: 6px; font-size: 28px; color: #FBFF26; }
          .footer { background: #1A2E1A; color: #EAEBEC; padding: 18px 30px; text-align: center; font-size: 12px; line-height: 1.6; }
          .footer a { color: #FBFF26; text-decoration: none; font-weight: 700; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="brand">
            <div class="logo">■ YOLO HEAT</div>
            <div class="company">
              YOLO HEAT LTD · Heating & Installation Specialists<br />
              London, United Kingdom · <a href="mailto:hello@yoloheat.co.uk" style="color:#1A2E1A;">hello@yoloheat.co.uk</a> · yoloheat.co.uk
            </div>
          </div>

          <div class="hero">
            <h1>Your quote details</h1>
            <p>Here is the full quote information prepared by YOLO HEAT.</p>
          </div>

          <div class="body">
            <div class="message">
              Hi ${customerName},<br /><br />
              ${safeDescription}
            </div>

            <div class="section">
              <h2 class="section-title">Customer Information</h2>
              <table class="table">
                <tr><td class="label">Name</td><td class="value">${customerName}</td></tr>
                <tr><td class="label">Email</td><td class="value">${customerEmail}</td></tr>
                <tr><td class="label">Phone</td><td class="value">${customerPhone}</td></tr>
                <tr><td class="label">Postcode</td><td class="value">${customerPostcode}</td></tr>
                <tr><td class="label">Install Address</td><td class="value">${installAddress}</td></tr>
              </table>
            </div>

            <div class="section">
              <h2 class="section-title">Quote Selection</h2>
              <table class="table">
                <tr><td class="label">Quote ID</td><td class="value">${quoteReference}</td></tr>
                <tr><td class="label">Product</td><td class="value">${productTitle}</td></tr>
                <tr><td class="label">Product Price</td><td class="value">${this.money(product.payablePrice ?? product.price ?? 0)}</td></tr>
                <tr><td class="label">Controller</td><td class="value">${controllerTitle}</td></tr>
                <tr><td class="label">Controller Price</td><td class="value">${this.money(controller.price ?? 0)}</td></tr>
                <tr><td class="label">Extra</td><td class="value">${extraTitle}</td></tr>
                <tr><td class="label">Extra Price</td><td class="value">${this.money(extra.price ?? 0)}</td></tr>
              </table>
            </div>

            <div class="section">
              <h2 class="section-title">Company Information</h2>
              <table class="table">
                <tr><td class="label">Company</td><td class="value">YOLO HEAT LTD</td></tr>
                <tr><td class="label">Email</td><td class="value">hello@yoloheat.co.uk</td></tr>
                <tr><td class="label">Website</td><td class="value">yoloheat.co.uk</td></tr>
                <tr><td class="label">Location</td><td class="value">London, United Kingdom</td></tr>
              </table>
            </div>

            <div class="total">
              <span>Full quote total</span>
              <strong>${this.money(total)}</strong>
            </div>
          </div>

          <div class="footer">
            You are receiving this email because you requested a quote from YOLO HEAT.<br />
            Contact us: <a href="mailto:hello@yoloheat.co.uk">hello@yoloheat.co.uk</a>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private buildInvoicePdfHtml(quote: any, price?: number | string) {
    const personal = quote.personalInfo ?? {};
    const product = quote.productId ?? {};
    const controller = quote.controller ?? {};
    const extra = quote.extra ?? {};
    const total = this.getQuoteTotal(quote, price);
    const invoiceNumber =
      quote.invoiceNumber ??
      `INV${String(quote._id ?? '')
        .slice(-6)
        .toUpperCase()}`;
    const customerName = this.escapeHtml(
      `${personal.title ?? ''} ${personal.fastName ?? ''} ${personal.sureName ?? ''}`.trim() ||
        'Customer',
    );
    const customerAddress = this.escapeHtml(personal.postcode ?? '');
    const productTitle = this.escapeHtml(product.title ?? 'Boiler package');
    const controllerTitle = controller.title
      ? `<br />Controller: ${this.escapeHtml(controller.title)}`
      : '';
    const extraTitle = extra.title
      ? `<br />Extra: ${this.escapeHtml(extra.title)}`
      : '';
    const installAddress = quote.installAddress
      ? `<br />Installation address: ${this.escapeHtml(quote.installAddress)}`
      : '';
    const invoiceDate = this.formatInvoiceDate(new Date());

    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <title>Sales Invoice</title>
          <style>
            @page { size: A4; margin: 34px; }
            body { margin: 0; color: #111111; font-family: Arial, Helvetica, sans-serif; font-size: 11px; }
            .page { padding: 42px 36px 28px; }
            .top { display: table; width: 100%; margin-bottom: 42px; }
            .address { display: table-cell; width: 50%; vertical-align: top; line-height: 1.35; }
            .seller { text-align: left; padding-left: 180px; }
            h1 { margin: 0 0 26px; text-align: center; font-size: 18px; font-style: italic; }
            .meta { width: 100%; margin-bottom: 24px; border-collapse: collapse; }
            .meta td { padding: 2px 0; }
            .meta .label { width: 145px; font-weight: 700; }
            .items { width: 100%; border-collapse: collapse; margin-top: 8px; }
            .items th { padding: 0 0 8px; text-align: left; font-weight: 700; border-bottom: 1px solid #d5d5d5; }
            .items th.amount, .items td.amount { text-align: right; width: 120px; }
            .items td { padding: 8px 0 88px; vertical-align: top; line-height: 1.35; }
            .total-row td { padding: 12px 0 0; border-top: 1px solid #9f9f9f; font-weight: 700; }
            .notes { margin-top: 46px; line-height: 1.45; font-style: italic; }
            .bank { margin-top: 16px; line-height: 1.45; }
          </style>
        </head>
        <body>
          <div class="page">
            <div class="top">
              <div class="address">
                <strong>${customerName}</strong><br />
                ${customerAddress}
              </div>
              <div class="address seller">
                <strong>YOLO HEAT LTD</strong><br />
                Heating & Installation Specialists<br />
                Main Road<br />
                Barnoldby le Beck<br />
                DN37 0BG<br />
                Grimsby
              </div>
            </div>

            <h1>Sales Invoice</h1>

            <table class="meta">
              <tr>
                <td class="label">Invoice Number</td>
                <td>${this.escapeHtml(invoiceNumber)}</td>
              </tr>
              <tr>
                <td class="label">Invoice Date</td>
                <td>${invoiceDate}</td>
              </tr>
            </table>

            <table class="items">
              <thead>
                <tr>
                  <th>Description</th>
                  <th class="amount">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    Fixed price quote for ${productTitle}, including installation.
                    ${controllerTitle}
                    ${extraTitle}
                    ${installAddress}
                  </td>
                  <td class="amount">${this.money(total)}</td>
                </tr>
                <tr class="total-row">
                  <td style="text-align: right;">Total Invoice (GBP)</td>
                  <td class="amount">${this.money(total)}</td>
                </tr>
              </tbody>
            </table>

            <div class="notes">
              Invoice date.<br />
              Late payment will be subject to a compensation payment, plus interest charged at 8% above the Bank Of England base rate.
            </div>

            <div class="bank">
              Payment should be made by bank transfer to the following account:<br />
              YOLO HEAT LTD<br />
              Sort Code: 00-00-00<br />
              Account: 00000000
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // ─── Sync unique users from Quote.personalInfo into Subscriber collection ─
  async syncSubscribersFromQuotes(): Promise<{
    synced: number;
    skipped: number;
  }> {
    const quotes = await this.quoteModel.find({
      'personalInfo.email': { $exists: true, $ne: '' },
    });

    let synced = 0;
    let skipped = 0;

    for (const quote of quotes) {
      const info = quote.personalInfo;
      if (!info?.email) {
        skipped++;
        continue;
      }

      const existing = await this.subscriberModel.findOne({
        email: info.email.toLowerCase(),
      });

      if (!existing) {
        await this.subscriberModel.create({
          email: info.email.toLowerCase(),
          firstName: info.fastName,
          sureName: info.sureName,
          mobileNumber: info.mobleNumber,
          postcode: info.postcode,
          title: info.title,
          status: 'active',
        });
        synced++;
      } else {
        skipped++;
      }
    }

    return { synced, skipped };
  }

  // ─── Send message + optional attachment to all non-admin customers ─────────
  async sendMessageToAll(
    sendMessageDto: SendMessageDto,
    file?: Express.Multer.File,
  ) {
    // 1. Upload attachment if provided
    if (file) {
      const uploaded = await fileUpload.uploadToCloudinary(file);
      sendMessageDto.attachmentUrl = uploaded.url;
      sendMessageDto.attachmentPublicId = uploaded.public_id;
    }

    // 2. Fetch all customer users except admins
    const customers = await this.userModel.find({
      role: { $ne: 'admin' },
      email: { $exists: true, $ne: '' },
    });

    if (!customers.length) {
      throw new HttpException('No customer users found', 404);
    }

    // 3. Send email to each customer individually
    const results = await Promise.allSettled(
      customers.map((customer) => {
        const displayName = customer.fullName?.trim() || customer.email;

        // const html = quoteEmailTemplate(quote, parsedPrice, parsedUrl);
        const html = buildEmailHtml(
          displayName,
          sendMessageDto.message,
          sendMessageDto.attachmentUrl,
        );

        return sendMailer(customer.email, sendMessageDto.subject, html);
      }),
    );

    // 4. Collect delivery report
    const succeeded = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results
      .filter((r) => r.status === 'rejected')
      .map((r, i) => ({
        email: customers[i].email,
        reason: (r as PromiseRejectedResult).reason?.message ?? 'Unknown error',
      }));

    return {
      total: customers.length,
      succeeded,
      failedCount: failed.length,
      failed,
    };
  }

  // ─── CRUD ──────────────────────────────────────────────────────────────────
  async sendCallbackMessage(callbackMessageDto: CallbackMessageDto) {
    const recipient =
      config.email.to ||
      config.email.admin ||
      config.email.address ||
      config.email.from;

    if (!recipient) {
      throw new HttpException(
        'Callback recipient email is not configured',
        500,
      );
    }
    const html = this.buildCallbackEmailHtml(callbackMessageDto);

    await sendMailer(recipient, callbackMessageDto.subject, html);

    return {
      name: callbackMessageDto.name,
      phoneNumber: callbackMessageDto.phoneNumber,
      reason: callbackMessageDto.reason,
      sentTo: recipient,
    };
  }

  async manuallaySendEmail(dto: ManuallaySendEmailDto) {
    const quote = await this.getInvoiceQuote(dto.quoteId);
    const email = quote.personalInfo?.email;

    if (!email) {
      throw new HttpException('No email address found on this quote', 400);
    }

    const html = this.buildManuallaySendEmailHtml(dto.description, quote);
    await sendMailer(email, 'Your YOLO HEAT quote details', html);

    return {
      quoteId: dto.quoteId,
      sentTo: email,
      customerName:
        `${quote.personalInfo?.title ?? ''} ${quote.personalInfo?.fastName ?? ''} ${quote.personalInfo?.sureName ?? ''}`.trim() ||
        'Customer',
      total: this.getQuoteTotal(quote),
      product: quote.productId?.title ?? null,
      controller: quote.controller?.title ?? null,
      extra: quote.extra?.title ?? null,
    };
  }

  private async getInvoiceQuote(quoteId: string): Promise<any> {
    const quote = await this.quoteModel
      .findById(quoteId)
      .populate('productId', 'title price payablePrice monthlyPrice')
      .populate('controller', 'title price')
      .populate('extra', 'title price')
      .lean();

    if (!quote) {
      throw new HttpException('Quote not found', 404);
    }

    return quote;
  }

  async generateInvoicePdf(quoteId: string, price?: number | string) {
    const quote = await this.getInvoiceQuote(quoteId);
    const html = this.buildInvoicePdfHtml(quote, price);
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }

  async sendInvoicePdfToQuoteCustomer(
    quoteId: string,
    price?: number | string,
  ) {
    const quote = await this.getInvoiceQuote(quoteId);
    const email = quote.personalInfo?.email;

    if (!email) {
      throw new HttpException('No email address found on this quote', 400);
    }

    const html = this.buildInvoicePdfHtml(quote, price);
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdfBuffer = Buffer.from(
        await page.pdf({ format: 'A4', printBackground: true }),
      );
      const invoiceNumber =
        quote.invoiceNumber ??
        `INV${String(quote._id ?? '')
          .slice(-6)
          .toUpperCase()}`;
      await sendMailer(email, 'Your YOLO HEAT Sales Invoice', undefined, [
        {
          filename: `invoice-${invoiceNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ]);

      return {
        message: 'Invoice PDF emailed successfully',
        sentTo: email,
        invoiceNumber,
      };
    } finally {
      await browser.close();
    }
  }

  async getAllSubscribers(params: IFilterParams, options: IOptions) {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper(options);
    const whereConditions = buildWhereConditions(
      params,
      subscriberSearchAbleFields,
    );
    const total = await this.subscriberModel.countDocuments(whereConditions);
    const subscribers = await this.subscriberModel
      .find(whereConditions)
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder } as any);

    return { meta: { page, limit, total }, data: subscribers };
  }

  async getSingleSubscriber(id: string) {
    const subscriber = await this.subscriberModel.findById(id);
    if (!subscriber) throw new HttpException('Subscriber not found', 404);
    return subscriber;
  }

  async updateSubscriber(
    id: string,
    updateSubscriberDto: UpdateSubscriberDto,
    file?: Express.Multer.File,
  ) {
    const subscriber = await this.subscriberModel.findById(id);
    if (!subscriber) throw new HttpException('Subscriber not found', 404);

    if (file) {
      const uploaded = await fileUpload.uploadToCloudinary(file);
      updateSubscriberDto.attachmentUrl = uploaded.url;
      updateSubscriberDto.attachmentPublicId = uploaded.public_id;
    }

    return this.subscriberModel.findByIdAndUpdate(id, updateSubscriberDto, {
      new: true,
    });
  }

  async deleteSubscriber(id: string) {
    const subscriber = await this.subscriberModel.findById(id);
    if (!subscriber) throw new HttpException('Subscriber not found', 404);
    return this.subscriberModel.findByIdAndDelete(id);
  }

  async unsubscribe(email: string) {
    const subscriber = await this.subscriberModel.findOne({ email });
    if (!subscriber) throw new HttpException('Subscriber not found', 404);
    return this.subscriberModel.findOneAndUpdate(
      { email },
      { status: 'unsubscribed' },
      { new: true },
    );
  }
}
