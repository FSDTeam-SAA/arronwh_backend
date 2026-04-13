import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

export type QuoteDocument = HydratedDocument<Quote>;

class QuoteQuizAnswer {
  @Prop()
  question: string;

  @Prop()
  answer: string;
}

class personalInfo {
  @Prop()
  title: string;

  @Prop()
  fastName: string;

  @Prop()
  sureName: string;

  @Prop()
  email: string;

  @Prop()
  mobleNumber: string;
}

@Schema({ timestamps: true })
export class Quote {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Service' })
  service?: Types.ObjectId;

  @Prop({ type: [QuoteQuizAnswer], _id: false, default: [] })
  quizAnswers: QuoteQuizAnswer[];

  @Prop({ type: personalInfo })
  personalInfo: personalInfo;

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
  payMounthly: boolean;

  @Prop({
    type: {
      deposit: { type: Number },
      mounthNumber: { type: Number },
      amount: { type: Number },
    },
    required: false,
  })
  payMounthlyData: {
    deposit: number;
    mounthNumber: number;
    amount: number;
  };
}

export const QuoteSchema = SchemaFactory.createForClass(Quote);
