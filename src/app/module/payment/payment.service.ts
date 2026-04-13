import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Stripe from 'stripe';
import config from 'src/app/config';
import { Payment, PaymentDocument } from './entities/payment.entity';
import { User, UserDocument } from '../user/entities/user.entity';
import {
  Subscribe,
  SubscribeDocument,
} from '../subscribe/entities/subscribe.entity';
import { IFilterParams } from 'src/app/helpers/pick';
import paginationHelper, { IOptions } from 'src/app/helpers/pagenation';

@Injectable()
export class PaymentService {
  private readonly stripe: Stripe;

  constructor(
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Subscribe.name)
    private readonly subscribeModel: Model<SubscribeDocument>,
  ) {
    this.stripe = new Stripe(config.stripe.secretKey!);
  }

  async payCarCheckerSubscribe(userId: string, subscribeId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new HttpException('User not found', 404);
    }

    const plan = await this.subscribeModel.findById(subscribeId);
    if (!plan) {
      throw new HttpException('Subscription plan not found', 404);
    }

    const existingCompleted = await this.paymentModel.findOne({
      user: user._id,
      subscribe: plan._id,
      status: 'completed',
    } as never);

    if (existingCompleted) {
      throw new HttpException('You already have this subscription', 400);
    }

    const existingPending = await this.paymentModel.findOne({
      user: user._id,
      subscribe: plan._id,
      status: 'pending',
    } as never);

    if (existingPending?.stripePaymentIntentId) {
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
          amount: plan.price,
        };
      }
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(plan.price * 100),
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId: user._id.toString(),
        subscribeId: plan._id.toString(),
        paymentType: 'subscription',
        amount: String(plan.price),
      },
    });

    if (existingPending) {
      existingPending.stripePaymentIntentId = paymentIntent.id;
      existingPending.amount = plan.price;
      await existingPending.save();
    } else {
      await this.paymentModel.create({
        user: user._id,
        subscribe: plan._id,
        stripePaymentIntentId: paymentIntent.id,
        amount: plan.price,
        paymentType: 'subscription',
        status: 'pending',
      });
    }

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: plan.price,
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
      .populate('user')
      .populate('subscribe');

    return {
      meta: {
        page,
        limit,
        total,
      },
      data,
    };
  }

  async getSinglePayment(id: string) {
    const payment = await this.paymentModel
      .findById(id)
      .populate('user')
      .populate('subscribe');

    if (!payment) {
      throw new HttpException('Payment not found', 404);
    }

    return payment;
  }
}
