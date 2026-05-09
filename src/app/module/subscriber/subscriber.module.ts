import { Module } from '@nestjs/common';
import { SubscriberController } from './subscriber.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Quote, QuoteSchema } from '../quote/entities/quote.entity';
import { Subscriber, SubscriberSchema } from './entities/subscriber.entity';
import { SubscriberService } from './subscriber.sevice';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Subscriber.name, schema: SubscriberSchema },
      { name: Quote.name, schema: QuoteSchema },   // ← needed to read quotes
    ]),
  ],
  controllers: [SubscriberController],
  providers: [SubscriberService],
})
export class SubscriberModule {}