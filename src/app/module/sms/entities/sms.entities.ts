import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SmsLogDocument = HydratedDocument<SmsLog>;

export enum SmsStatus {
  SENT = 'sent',
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
    default: SmsStatus.SENT,
  })
  status: SmsStatus;

  @Prop()
  errorMessage: string;

  createdAt: Date;
}

export const SmsLogSchema = SchemaFactory.createForClass(SmsLog);
