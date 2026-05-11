import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subscriber, SubscriberDocument } from './entities/subscriber.entity';
import { Quote, QuoteDocument } from '../quote/entities/quote.entity';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { CallbackMessageDto } from './dto/callback.dto';
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

  // ─── Send message + optional attachment to ALL active subscribers ──────────
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

    // 2. Fetch all active subscribers
    const activeSubscribers = await this.subscriberModel.find({
      status: 'active',
    });

    if (!activeSubscribers.length) {
      throw new HttpException('No active subscribers found', 404);
    }

    // 3. Send email to each subscriber individually
    const results = await Promise.allSettled(
      activeSubscribers.map((subscriber) => {
        const displayName =
          `${subscriber.title ?? ''} ${subscriber.firstName ?? ''} ${subscriber.sureName ?? ''}`.trim() ||
          subscriber.email;

        // const html = quoteEmailTemplate(quote, parsedPrice, parsedUrl);
        const html = buildEmailHtml(
          displayName,
          sendMessageDto.message,
          sendMessageDto.attachmentUrl,
        );

        return sendMailer(subscriber.email, sendMessageDto.subject, html);
      }),
    );

    // 4. Persist the last sent message + attachment on each subscriber record
    await this.subscriberModel.updateMany(
      { status: 'active' },
      {
        $set: {
          message: sendMessageDto.message,
          attachmentUrl: sendMessageDto.attachmentUrl,
          attachmentPublicId: sendMessageDto.attachmentPublicId,
        },
      },
    );

    // 5. Collect delivery report
    const succeeded = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results
      .filter((r) => r.status === 'rejected')
      .map((r, i) => ({
        email: activeSubscribers[i].email,
        reason: (r as PromiseRejectedResult).reason?.message ?? 'Unknown error',
      }));

    return {
      total: activeSubscribers.length,
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
