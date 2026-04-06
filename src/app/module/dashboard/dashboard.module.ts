import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { User, UserSchema } from '../user/entities/user.entity';
import { Booking, BookingSchema } from '../booking/entities/booking.entity';
import { Payment, PaymentSchema } from '../payment/entities/payment.entity';
import { Contact, ContactSchema } from '../contact/entities/contact.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Booking.name, schema: BookingSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: Contact.name, schema: ContactSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
