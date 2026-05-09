import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subscriber, SubscriberDocument } from './entities/subscriber.entity';
import { Quote, QuoteDocument } from '../quote/entities/quote.entity';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { fileUpload } from 'src/app/helpers/fileUploder';
import { IFilterParams } from 'src/app/helpers/pick';
import paginationHelper, { IOptions } from 'src/app/helpers/pagenation';
import buildWhereConditions from 'src/app/helpers/buildWhereConditions';
import sendMailer from 'src/app/helpers/sendMailer';
import { buildEmailHtml } from 'src/app/helpers/template';

const subscriberSearchAbleFields = ['email', 'firstName', 'status', 'postcode'];

@Injectable()
export class SubscriberService {
  constructor(
    @InjectModel(Subscriber.name)
    private readonly subscriberModel: Model<SubscriberDocument>,

    @InjectModel(Quote.name)
    private readonly quoteModel: Model<QuoteDocument>,
  ) {}

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
