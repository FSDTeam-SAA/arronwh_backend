// src/app/module/quote/quote.cron.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as cron from 'node-cron';
import { Quote } from './entities/quote.entity';
import { Payment } from '../payment/entities/payment.entity';
import sendMailer from 'src/app/helpers/sendMailer';
import { buildFollowUpEmail } from 'src/app/helpers/template';

@Injectable()
export class QuoteCronService {
  private readonly logger = new Logger(QuoteCronService.name);

  constructor(
    @InjectModel(Quote.name) private quoteModel: Model<Quote>,
    @InjectModel(Payment.name) private paymentModel: Model<Payment>,
  ) {}

  onModuleInit() {
    // Run every minute.
    cron.schedule('* * * * *', () => {
      this.sendFollowUpEmails();
    });

    this.logger.log('Quote follow-up cron job started');
  }

  private getCandidatePaymentIds(quote: any) {
    return [quote._id, quote.bookingId].filter(Boolean);
  }

  private calculateQuoteTotal(quote: any): number {
    if (
      typeof quote.quotePrice === 'number' &&
      Number.isFinite(quote.quotePrice)
    ) {
      return quote.quotePrice;
    }

    const product = quote.productId ?? {};
    const controller = quote.controller ?? {};
    const extra = quote.extra ?? {};

    const productPrice = product.payablePrice ?? product.price ?? 0;
    const controllerPrice = controller.price ?? 0;
    const extraPrice = extra.price ?? 0;
    const subtotal = productPrice + controllerPrice + extraPrice;

    const coupon = quote.coupon ?? null;
    const couponDiscount =
      coupon?.type === 'percentage'
        ? Math.round((subtotal * coupon.value) / 100)
        : (coupon?.value ?? 0);

    return Math.max(subtotal - couponDiscount, 0);
  }

  private getCustomerName(quote: any): string {
    return [
      quote.personalInfo?.title,
      quote.personalInfo?.fastName,
      quote.personalInfo?.sureName,
    ]
      .filter(Boolean)
      .join(' ')
      .trim() || 'there';
  }

  private hasCompletedPayment(quote: any, completedPaymentIds: Set<string>) {
    return this.getCandidatePaymentIds(quote).some((id) =>
      completedPaymentIds.has(id.toString()),
    );
  }

  async sendFollowUpEmails() {
    this.logger.log('Running quote follow-up email job...');

    const now = new Date();

    // 24 hours ago window (between 24h and 25h ago)
    // const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    // const twentyFiveHoursAgo = new Date(now.getTime() - 25 * 60 * 60 * 1000);

    // 48 hours ago window (between 48h and 49h ago)
    // const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    // const fortyNineHoursAgo = new Date(now.getTime() - 49 * 60 * 60 * 1000);

    // First follow-up: 2 minutes ago window (between 2min and 3min ago)
    const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);
    const threeMinutesAgo = new Date(now.getTime() - 3 * 60 * 1000);

    // Second follow-up: 4 minutes ago window (between 4min and 5min ago)
    const fourMinutesAgo = new Date(now.getTime() - 4 * 60 * 1000);
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    // Get all quotes created in these windows.
    // const [firstFollowUpQuotes, secondFollowUpQuotes] = await Promise.all([
    //   this.quoteModel
    //     .find({
    //       createdAt: { $gte: twentyFiveHoursAgo, $lte: twentyFourHoursAgo },
    //     })
    //     .populate('productId', 'title price payablePrice')
    //     .populate('controller', 'title price')
    //     .populate('extra', 'title price')
    //     .lean(),

    //   this.quoteModel
    //     .find({
    //       createdAt: { $gte: fortyNineHoursAgo, $lte: fortyEightHoursAgo },
    //     })
    //     .populate('productId', 'title price payablePrice')
    //     .populate('controller', 'title price')
    //     .populate('extra', 'title price')
    //     .lean(),
    // ]);

    const [firstFollowUpQuotes, secondFollowUpQuotes] = await Promise.all([
      this.quoteModel
        .find({
          createdAt: { $gte: threeMinutesAgo, $lte: twoMinutesAgo },
        })
        .populate('productId', 'title price payablePrice')
        .populate('controller', 'title price')
        .populate('extra', 'title price')
        .lean(),

      this.quoteModel
        .find({
          createdAt: { $gte: fiveMinutesAgo, $lte: fourMinutesAgo },
        })
        .populate('productId', 'title price payablePrice')
        .populate('controller', 'title price')
        .populate('extra', 'title price')
        .lean(),
    ]);

    const allPaymentIds = [
      ...firstFollowUpQuotes.flatMap((q) => this.getCandidatePaymentIds(q)),
      ...secondFollowUpQuotes.flatMap((q) => this.getCandidatePaymentIds(q)),
    ];

    const completedPayments = await this.paymentModel
      .find({
        bookingId: { $in: allPaymentIds },
        status: 'completed',
      })
      .lean();

    const completedPaymentIds = new Set(
      completedPayments.map((p) => p.bookingId.toString()),
    );

    for (const quote of firstFollowUpQuotes) {
      const quoteId = (quote._id as any).toString();

      if (this.hasCompletedPayment(quote, completedPaymentIds)) {
        this.logger.log(`Skipping quote ${quoteId} - booking already completed`);
        continue;
      }

      const email = quote.personalInfo?.email;
      if (!email) continue;

      const name = this.getCustomerName(quote);
      const quoteTotal = this.calculateQuoteTotal(quote);

      try {
        const html = buildFollowUpEmail(name, quoteTotal);
        await sendMailer(email, 'Still thinking? Your quote is saved!', html);
        this.logger.log(`First follow-up sent to ${email}`);
      } catch (err) {
        this.logger.error(`Failed to send first follow-up to ${email}`, err);
      }
    }

    for (const quote of secondFollowUpQuotes) {
      const quoteId = (quote._id as any).toString();

      if (this.hasCompletedPayment(quote, completedPaymentIds)) {
        this.logger.log(`Skipping quote ${quoteId} - booking already completed`);
        continue;
      }

      const email = quote.personalInfo?.email;
      if (!email) continue;

      const name = this.getCustomerName(quote);
      const quoteTotal = this.calculateQuoteTotal(quote);

      try {
        const html = buildFollowUpEmail(name, quoteTotal, true);
        await sendMailer(email, 'Last reminder - your boiler quote is ready', html);
        this.logger.log(`Second follow-up sent to ${email}`);
      } catch (err) {
        this.logger.error(`Failed to send second follow-up to ${email}`, err);
      }
    }
  }
}
