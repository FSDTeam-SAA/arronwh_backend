import { Module } from '@nestjs/common';
import { ExtraService } from './extra.service';
import { ExtraController } from './extra.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Extra, ExtraSchema } from './entities/extra.entities';
import { Quote, QuoteSchema } from '../quote/entities/quote.entity';
import { Booking, BookingSchema } from '../booking/entities/booking.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Extra.name, schema: ExtraSchema },
      { name: Quote.name, schema: QuoteSchema },
      { name: Booking.name, schema: BookingSchema },
    ]),
  ],
  controllers: [ExtraController],
  providers: [ExtraService],
})
export class ExtraModule {}
