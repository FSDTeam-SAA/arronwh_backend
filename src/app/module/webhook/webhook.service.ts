// // webhook/webhook.service.ts
// import { HttpException, Injectable, Logger } from '@nestjs/common';
// import Stripe from 'stripe';
// import config from 'src/app/config';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { Payment, PaymentDocument } from '../payment/entities/payment.entity';
// import { Booking, BookingDocument } from '../booking/entities/booking.entity';
// import type { Response } from 'express';
// import { quoteEmailTemplate } from 'src/app/helpers/quoteEmailTemplate';
// import sendMailer from 'src/app/helpers/sendMailer';
// import { Quote, QuoteDocument } from '../quote/entities/quote.entity';

// @Injectable()
// export class WebhookService {
//   private readonly stripe: Stripe = new Stripe(config.stripe.secretKey!);
//   private readonly logger = new Logger(WebhookService.name);

//   constructor(
//     @InjectModel(Payment.name)
//     private readonly paymentModel: Model<PaymentDocument>,
//     @InjectModel(Booking.name)
//     private readonly bookingModel: Model<BookingDocument>,
//     @InjectModel(Quote.name)
//     private readonly quoteModel: Model<QuoteDocument>,
//   ) {}

//   async handleWebhook(rawBody: Buffer, sig: string, res: Response) {
//     if (!sig) {
//       throw new HttpException('Missing stripe signature', 400);
//     }

//     let event: Stripe.Event;
//     try {
//       event = this.stripe.webhooks.constructEvent(
//         rawBody,
//         sig,
//         config.stripe.webhookSecret!,
//       );
//     } catch (err: any) {
//       this.logger.error(`Webhook signature error: ${err.message}`);
//       return res.status(400).send(`Webhook Error: ${err.message}`);
//     }

//     try {
//       switch (event.type) {
//         case 'payment_intent.succeeded':
//           await this.handlePaymentIntentSucceeded(event);
//           break;

//         case 'payment_intent.payment_failed':
//           await this.handlePaymentIntentFailed(event);
//           break;

//         default:
//           this.logger.log(`Unhandled event type: ${event.type}`);
//           break;
//       }
//     } catch (err: any) {
//       this.logger.error(`Handler error: ${err.message}`);
//       return res.status(500).send(`Webhook Handler Error: ${err.message}`);
//     }

//     return res.json({ received: true });
//   }

//   private async handlePaymentIntentSucceeded(event: Stripe.Event) {
//     const intent = event.data.object as Stripe.PaymentIntent;

//     const payment = await this.paymentModel.findOne({
//       stripePaymentIntentId: intent.id,
//     });
//     if (!payment) return;

//     // Update payment status
//     payment.status = 'completed';
//     await payment.save();
//     const booking = await this.bookingModel.findById(payment.bookingId);
//     if (!booking) return;
//     const quote = await this.quoteModel.findById(booking.quote);
//     if (!quote) return;

//     const html = quoteEmailTemplate(quote);
//     await sendMailer(
//       quote.personalInfo?.email!,
//       'Your payment is successful',
//       html,
//     );
//     // Update booking status to confirmed
//     await this.bookingModel.findByIdAndUpdate(payment.bookingId, {
//       status: 'confirmed',
//     });
//   }

//   private async handlePaymentIntentFailed(event: Stripe.Event) {
//     const intent = event.data.object as Stripe.PaymentIntent;

//     const payment = await this.paymentModel.findOne({
//       stripePaymentIntentId: intent.id,
//     });
//     if (!payment) return;

//     payment.status = 'failed';
//     await payment.save();

//     // Update booking status to cancelled
//     await this.bookingModel.findByIdAndUpdate(payment.bookingId, {
//       status: 'cancelled',
//     });
//   }
// }

// webhook/webhook.service.ts
import { HttpException, Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import config from 'src/app/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentDocument } from '../payment/entities/payment.entity';
import { Booking, BookingDocument } from '../booking/entities/booking.entity';
import type { Response } from 'express';
import { quoteEmailTemplate } from 'src/app/helpers/quoteEmailTemplate';
import sendMailer from 'src/app/helpers/sendMailer';
import { Quote, QuoteDocument } from '../quote/entities/quote.entity';

@Injectable()
export class WebhookService {
  private readonly stripe: Stripe = new Stripe(config.stripe.secretKey!);
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
    @InjectModel(Quote.name)
    private readonly quoteModel: Model<QuoteDocument>,
  ) {}

  async handleWebhook(rawBody: Buffer, sig: string, res: Response) {
    if (!sig) {
      throw new HttpException('Missing stripe signature', 400);
    }

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        sig,
        config.stripe.webhookSecret!,
      );
    } catch (err: any) {
      this.logger.error(`Webhook signature error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(event);
          break;

        case 'checkout.session.completed':
          await this.handleCheckoutSessionCompleted(event);
          break;

        default:
          this.logger.log(`Unhandled event type: ${event.type}`);
          break;
      }
    } catch (err: any) {
      this.logger.error(`Handler error: ${err.message}`);
      return res.status(500).send(`Webhook Handler Error: ${err.message}`);
    }

    return res.json({ received: true });
  }

  private async handlePaymentIntentSucceeded(event: Stripe.Event) {
    const intent = event.data.object as Stripe.PaymentIntent;

    const payment = await this.paymentModel.findOne({
      stripePaymentIntentId: intent.id,
    });
    if (!payment) return;

    // Update payment status
    payment.status = 'completed';
    await payment.save();
    const booking = await this.bookingModel.findById(payment.bookingId);
    if (!booking) return;
    const quote = await this.quoteModel.findById(booking.quote);
    if (!quote) return;

    // Update booking status to confirmed
    await this.bookingModel.findByIdAndUpdate(payment.bookingId, {
      status: 'confirmed',
    });

    const html = quoteEmailTemplate(quote);
    await sendMailer(
      quote.personalInfo?.email!,
      'Your payment is successful',
      html,
    );
  }

  private async handlePaymentIntentFailed(event: Stripe.Event) {
    const intent = event.data.object as Stripe.PaymentIntent;

    const payment = await this.paymentModel.findOne({
      stripePaymentIntentId: intent.id,
    });
    if (!payment) return;

    payment.status = 'failed';
    await payment.save();

    // Update booking status to cancelled
    await this.bookingModel.findByIdAndUpdate(payment.bookingId, {
      status: 'cancelled',
    });
  }

  // Handles Apple Pay payments made via Stripe Payment Link
  private async handleCheckoutSessionCompleted(event: Stripe.Event) {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.bookingId;
    if (!bookingId) return;

    // Find payment by bookingId
    const payment = await this.paymentModel.findOne({ bookingId });
    if (!payment) return;

    payment.status = 'completed';
    await payment.save();

    const booking = await this.bookingModel.findByIdAndUpdate(
      bookingId,
      { status: 'confirmed' },
      { new: true },
    );
    if (!booking) return;

    const quote = await this.quoteModel.findById(booking.quote);
    if (!quote) return;

    const html = quoteEmailTemplate(quote);
    await sendMailer(
      quote.personalInfo?.email!,
      'Your payment is successful',
      html,
    );
  }
}
