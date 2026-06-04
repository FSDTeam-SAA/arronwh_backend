import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SmsLogDocument = HydratedDocument<SmsLog>;

export enum SmsStatus {
  ACCEPTED = 'accepted',
  QUEUED = 'queued',
  SENDING = 'sending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  UNDELIVERED = 'undelivered',
  FAILED = 'failed',
}

@Schema({ timestamps: true })
export class SmsLog {
  id: string;

  @Prop({ required: true })
  to: string;

  @Prop({ required: true })
  message: string;

  @Prop()
  twilioSid: string;

  @Prop({
    enum: SmsStatus,
    default: SmsStatus.QUEUED,
  })
  status: SmsStatus;

  @Prop()
  errorMessage: string;

  @Prop()
  errorCode: string;

  @Prop()
  from: string;

  @Prop()
  sentAt: Date;

  @Prop()
  deliveredAt: Date;

  createdAt: Date;
}

export const SmsLogSchema = SchemaFactory.createForClass(SmsLog);
