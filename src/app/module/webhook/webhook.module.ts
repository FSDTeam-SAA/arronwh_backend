// webhook/webhook.module.ts
import { Module } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { WebhookController } from './webhook.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from '../payment/entities/payment.entity';
import { Booking, BookingSchema } from '../booking/entities/booking.entity';
import { Quote, QuoteSchema } from '../quote/entities/quote.entity';
import { EmailTemplateModule } from '../email-template/email-template.module';

@Module({
  imports: [
    EmailTemplateModule,
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: Booking.name, schema: BookingSchema },
      { name: Quote.name, schema: QuoteSchema },
    ]),
  ],
  controllers: [WebhookController],
  providers: [WebhookService],
})
export class WebhookModule {}
