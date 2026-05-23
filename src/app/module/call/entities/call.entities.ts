import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CallLogDocument = HydratedDocument<CallLog>;

export enum CallStatus {
  QUEUED = 'queued',
  INITIATED = 'initiated',
  RINGING = 'ringing',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  BUSY = 'busy',
  FAILED = 'failed',
  NO_ANSWER = 'no-answer',
  CANCELED = 'canceled',
}

@Schema({ timestamps: true })
export class CallLog {
  id: string;

  @Prop({ required: true })
  to: string;

  @Prop({ required: true })
  message: string;

  @Prop()
  twilioCallSid: string;

  @Prop({
    enum: CallStatus,
    default: CallStatus.INITIATED,
  })
  status: CallStatus;

  @Prop()
  statusCallbackUrl: string;

  @Prop()
  recordingCallbackUrl: string;

  @Prop()
  callDuration: string;

  @Prop()
  recordingSid: string;

  @Prop()
  recordingUrl: string;

  @Prop()
  recordingDuration: string;

  @Prop()
  recordingStatus: string;

  @Prop()
  errorMessage: string;

  createdAt: Date;
}

export const CallLogSchema = SchemaFactory.createForClass(CallLog);
