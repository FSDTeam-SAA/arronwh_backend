import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SubscriberDocument = HydratedDocument<Subscriber>;

@Schema({ timestamps: true })
export class Subscriber {
  @Prop({
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  })
  email: string;

  @Prop({ trim: true })
  firstName: string;

  @Prop({ trim: true })
  sureName: string;

  @Prop()
  mobileNumber: string;

  @Prop()
  postcode: string;

  @Prop()
  title: string;

  // The message sent to this subscriber
  @Prop()
  message: string;

  // Optional attachment uploaded via Cloudinary
  @Prop()
  attachmentUrl: string;

  @Prop()
  attachmentPublicId: string;

  @Prop({
    enum: ['active', 'unsubscribed'],
    default: 'active',
  })
  status: string;
}

export const SubscriberSchema = SchemaFactory.createForClass(Subscriber);