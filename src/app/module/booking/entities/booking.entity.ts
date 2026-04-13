import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type BookingDocument = HydratedDocument<Booking>;

@Schema({ timestamps: true })
export class Booking {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Quote', required: true })
  quote: mongoose.Types.ObjectId;

  @Prop({ required: true })
  price: number;

  @Prop({
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending',
  })
  status: string;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
