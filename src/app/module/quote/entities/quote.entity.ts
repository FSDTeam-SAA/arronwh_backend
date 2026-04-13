import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

export type QuoteDocument = HydratedDocument<Quote>;

@Schema({ timestamps: true })
export class Quote {
  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Quize' })
  quizes: Types.ObjectId[];

  @Prop({
    type: {
      title: { type: String },
      firstName: { type: String },
      surName: { type: String },
      email: { type: String },
      mobileNumber: { type: String },
    },
    required: false,
  })
  personalInfo: {
    title: string;
    firstName: string;
    surName: string;
    email: string;
    mobileNumber: string;
  };

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Service' })
  serviceId: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'BoilerController' })
  controller: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Extra' })
  extra: Types.ObjectId;

  @Prop()
  surveyDate: Date;

  @Prop()
  installDate: Date;

  @Prop()
  installAddress: string;

  @Prop()
  payByCard: boolean;

  @Prop()
  payMonthly: boolean;

  @Prop({
    type: {
      deposit: { type: Number },
      monthNumber: { type: Number },
      amount: { type: Number },
    },
    required: false,
  })
  payMonthlyData: {
    deposit: number;
    monthNumber: number;
    amount: number;
  };
}

export const QuoteSchema = SchemaFactory.createForClass(Quote);
