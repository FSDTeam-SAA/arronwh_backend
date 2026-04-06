import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type BookingDocument = HydratedDocument<Booking>;

class BookingQuizAnswer {
  @Prop()
  question: string;

  @Prop()
  answer: string;
}

class BookingOption {
  @Prop()
  title: string;

  @Prop()
  value: string;

  @Prop()
  price: number;

  @Prop({ default: false })
  included: boolean;
}

class BookingCalendarDate {
  @Prop({ required: true })
  date: string;

  @Prop({ default: 'available' })
  status: string;
}

@Schema({ timestamps: true })
export class Booking {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Service' })
  service?: mongoose.Types.ObjectId;

  @Prop({ required: true, trim: true })
  customerName: string;

  @Prop({ required: true, trim: true, lowercase: true })
  email: string;

  @Prop({ required: true, trim: true })
  phoneNumber: string;

  @Prop({ trim: true })
  address?: string;

  @Prop({ trim: true })
  companyName?: string;

  @Prop({ trim: true })
  bookingType?: string;

  @Prop({ trim: true })
  due: string;

  @Prop({ trim: true })
  date: string;

  @Prop({ trim: true })
  status: string;

  @Prop({ trim: true })
  bookingBy?: string;

  @Prop({ trim: true })
  notes?: string;

  @Prop({ trim: true })
  paymentStatus?: string;

  @Prop()
  subtotal?: number;

  @Prop()
  total?: number;

  @Prop({ type: [BookingQuizAnswer], _id: false, default: [] })
  quizAnswers: BookingQuizAnswer[];

  @Prop({ type: [BookingOption], _id: false, default: [] })
  selectedOptions: BookingOption[];

  @Prop({ type: [BookingCalendarDate], _id: false, default: [] })
  bookingCalendar: BookingCalendarDate[];
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
