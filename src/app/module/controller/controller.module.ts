import { Module } from '@nestjs/common';
import { ControllerService } from './controller.service';
import { ControllerController } from './controller.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  BoilerController,
  BoilerControllerSchema,
} from './entities/controller.entities';
import { Quote, QuoteSchema } from '../quote/entities/quote.entity';
import { Booking, BookingSchema } from '../booking/entities/booking.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BoilerController.name, schema: BoilerControllerSchema },
      { name: Quote.name, schema: QuoteSchema },
      { name: Booking.name, schema: BookingSchema },
    ]),
  ],
  controllers: [ControllerController],
  providers: [ControllerService],
})
export class ControllerModule {}
