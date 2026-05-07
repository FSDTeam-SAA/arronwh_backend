// src/app/module/quote/quote.cron.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as cron from 'node-cron';
import { Quote } from './entities/quote.entity';
import { Payment } from '../payment/entities/payment.entity';
import { quoteEmailTemplate } from 'src/app/helpers/quoteEmailTemplate';
import sendMailer from 'src/app/helpers/sendMailer';

@Injectable()
export class QuoteCronService {
  private readonly logger = new Logger(QuoteCronService.name);

  constructor(
    @InjectModel(Quote.name) private quoteModel: Model<Quote>,
    @InjectModel(Payment.name) private paymentModel: Model<Payment>,
  ) {}

  onModuleInit() {
    // Run every hour
    cron.schedule('* * * * *', () => {
      this.sendFollowUpEmails();
    });

    this.logger.log('Quote follow-up cron job started');
  }

  async sendFollowUpEmails() {
    this.logger.log('Running quote follow-up email job...');

    const now = new Date();

    // 24 hours ago window (between 24h and 25h ago)
    // const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    // const twentyFiveHoursAgo = new Date(now.getTime() - 25 * 60 * 60 * 1000);

    // // 48 hours ago window (between 48h and 49h ago)
    // const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    // const fortyNineHoursAgo = new Date(now.getTime() - 49 * 60 * 60 * 1000);
     // First follow-up: 2 minutes ago window (between 2min and 3min ago)
    const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);
    const threeMinutesAgo = new Date(now.getTime() - 3 * 60 * 1000);

    // Second follow-up: 4 minutes ago window (between 4min and 5min ago)
    const fourMinutesAgo = new Date(now.getTime() - 4 * 60 * 1000);
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);


    // Get all quotes created in these windows
    // const [firstFollowUpQuotes, secondFollowUpQuotes] = await Promise.all([
    //   this.quoteModel
    //     .find({
    //       createdAt: { $gte: twentyFiveHoursAgo, $lte: twentyFourHoursAgo },
    //     })
    //     .populate('productId', 'title price payablePrice')
    //     .lean(),

    //   this.quoteModel
    //     .find({
    //       createdAt: { $gte: fortyNineHoursAgo, $lte: fortyEightHoursAgo },
    //     })
    //     .populate('productId', 'title price payablePrice')
    //     .lean(),
    // ]);

     const [firstFollowUpQuotes, secondFollowUpQuotes] = await Promise.all([
        this.quoteModel
        .find({
            createdAt: { $gte: threeMinutesAgo, $lte: twoMinutesAgo },
        })
        .populate('productId', 'title price payablePrice')
        .lean(),

        this.quoteModel
        .find({
            createdAt: { $gte: fiveMinutesAgo, $lte: fourMinutesAgo },
        })
        .populate('productId', 'title price payablePrice')
        .lean(),
    ]);

    // Get all quote IDs that have a completed payment (booking completed)
    const allQuoteIds = [
      ...firstFollowUpQuotes.map((q) => q._id),
      ...secondFollowUpQuotes.map((q) => q._id),
    ];

    const completedPayments = await this.paymentModel
      .find({
        bookingId: { $in: allQuoteIds },
        status: 'completed',
      })
      .lean();

    const completedQuoteIds = new Set(
      completedPayments.map((p) => p.bookingId.toString()),
    );

    // Send first follow-up (24h) — skip if booking completed
    for (const quote of firstFollowUpQuotes) {
      const quoteId = (quote._id as any).toString();

      if (completedQuoteIds.has(quoteId)) {
        this.logger.log(`Skipping quote ${quoteId} — booking already completed`);
        continue;
      }

      const email = quote.personalInfo?.email;
      if (!email) continue;

      try {
        const html = quoteEmailTemplate(quote);
        await sendMailer(email, 'Still thinking? Your quote is saved!', html);
        this.logger.log(`First follow-up sent to ${email}`);
      } catch (err) {
        this.logger.error(`Failed to send first follow-up to ${email}`, err);
      }
    }

    // Send second follow-up (48h) — skip if booking completed
    for (const quote of secondFollowUpQuotes) {
      const quoteId = (quote._id as any).toString();

      if (completedQuoteIds.has(quoteId)) {
        this.logger.log(`Skipping quote ${quoteId} — booking already completed`);
        continue;
      }

      const email = quote.personalInfo?.email;
      if (!email) continue;

      try {
        const html = quoteEmailTemplate(quote);
        await sendMailer(email, 'Last reminder — your boiler quote is ready', html);
        this.logger.log(`Second follow-up sent to ${email}`);
      } catch (err) {
        this.logger.error(`Failed to send second follow-up to ${email}`, err);
      }
    }
  }
}