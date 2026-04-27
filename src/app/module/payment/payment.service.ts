// payment/payment.service.ts
import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Stripe from 'stripe';
import config from 'src/app/config';
import { Payment, PaymentDocument } from './entities/payment.entity';
import { IFilterParams } from 'src/app/helpers/pick';
import paginationHelper, { IOptions } from 'src/app/helpers/pagenation';
import { Booking, BookingDocument } from '../booking/entities/booking.entity';
import { Quote, QuoteDocument } from '../quote/entities/quote.entity';
import { quoteEmailTemplate } from 'src/app/helpers/quoteEmailTemplate';
import sendMailer from 'src/app/helpers/sendMailer';

@Injectable()
export class PaymentService {
  private readonly stripe: Stripe;

  constructor(
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
    @InjectModel(Quote.name)
    private readonly quoteModel: Model<QuoteDocument>,
  ) {
    this.stripe = new Stripe(config.stripe.secretKey!);
  }

  async payBooking(bookingId: string) {
    const stripePublishableKey = config.stripe.publicKey;
    if (!stripePublishableKey) {
      throw new HttpException('Stripe publishable key is not configured', 500);
    }

    // 1. Find booking
    const booking = await this.bookingModel.findById(bookingId);
    if (!booking) {
      throw new HttpException('Booking not found', 404);
    }

    // 2. Find quote from booking
    const quote = await this.quoteModel.findById(booking.quote);
    if (!quote) {
      throw new HttpException('Quote not found', 404);
    }

    // 3. Check if already paid
    const existingCompleted = await this.paymentModel.findOne({
      bookingId: booking._id,
      status: 'completed',
    });

    if (existingCompleted) {
      throw new HttpException('This booking is already paid', 400);
    }

    // 4. Check if pending payment exists — reuse it
    const existingPending = await this.paymentModel.findOne({
      bookingId: booking._id,
      status: 'pending',
    });

    if (existingPending?.stripePaymentIntentId) {
      try {
        const existingPaymentIntent = await this.stripe.paymentIntents.retrieve(
          existingPending.stripePaymentIntentId,
        );

        if (
          existingPaymentIntent.status !== 'succeeded' &&
          existingPaymentIntent.status !== 'canceled'
        ) {
          return {
            clientSecret: existingPaymentIntent.client_secret,
            paymentIntentId: existingPaymentIntent.id,
            amount: booking.price,
            currency: existingPaymentIntent.currency,
            publishableKey: stripePublishableKey,
          };
        }
      } catch (error) {
        const errorCode =
          typeof error === 'object' &&
          error !== null &&
          'code' in error &&
          typeof (error as { code?: unknown }).code === 'string'
            ? (error as { code?: string }).code
            : undefined;

        if (errorCode !== 'resource_missing') {
          throw error;
        }
      }
    }

    // 5. Create new Stripe payment intent
    const paymentIntentPayload: Stripe.PaymentIntentCreateParams = {
      amount: Math.round(booking.price * 100),
      currency: 'gbp',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        bookingId: booking._id.toString(),
        quoteId: quote._id.toString(),
        paymentType: 'booking',
        amount: String(booking.price),
        publishableKey: stripePublishableKey,
      },
    };
    const paymentMethodConfig = config.stripe.paymentMethodConfig?.trim();
    if (paymentMethodConfig) {
      paymentIntentPayload.payment_method_configuration = paymentMethodConfig;
    }

    const paymentIntent = await this.stripe.paymentIntents.create(
      paymentIntentPayload,
    );
    const html = quoteEmailTemplate(quote);
    const email = quote.personalInfo?.email;
    // 6. Save or update payment record
    if (existingPending) {
      existingPending.stripePaymentIntentId = paymentIntent.id;
      existingPending.amount = booking.price;
      //send email to user if payment intent already exists but not completed yet
      await sendMailer(email!, 'Your pending payment is completed', html);
      await existingPending.save();
    } else {
      await this.paymentModel.create({
        bookingId: booking._id,
        name: quote.personalInfo.fastName + ' ' + quote.personalInfo.sureName,
        email: quote.personalInfo.email,
        stripePaymentIntentId: paymentIntent.id,
        amount: booking.price,
        paymentType: 'booking',
        status: 'pending',
      });
      //send email to user if payment intent created successfully
      await sendMailer(email!, 'Your payment intent is created', html);
    }

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: booking.price,
      currency: paymentIntent.currency,
      publishableKey: stripePublishableKey,
    };
  }

  async getAllPayment(params: IFilterParams, options: IOptions) {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper(options);
    const { searchTerm, ...filterData } = params;

    const whereConditions: Record<string, unknown> = {};

    if (searchTerm) {
      whereConditions.$or = [
        { paymentType: { $regex: searchTerm, $options: 'i' } },
        { status: { $regex: searchTerm, $options: 'i' } },
        { name: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    if (filterData.paymentType) {
      whereConditions.paymentType = filterData.paymentType;
    }

    if (filterData.status) {
      whereConditions.status = filterData.status;
    }

    const total = await this.paymentModel.countDocuments(whereConditions);
    const data = await this.paymentModel
      .find(whereConditions)
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder } as never)
      .populate({
        path: 'bookingId',
        populate: {
          path: 'quote',
          populate: ['productId', 'controller', 'extra'],
        },
      });

    return {
      meta: { page, limit, total },
      data,
    };
  }

  async getSinglePayment(id: string) {
    const payment = await this.paymentModel.findById(id).populate({
      path: 'bookingId',
      populate: {
        path: 'quote',
        populate: ['productId', 'controller', 'extra'],
      },
    });

    if (!payment) {
      throw new HttpException('Payment not found', 404);
    }

    return payment;
  }
}
