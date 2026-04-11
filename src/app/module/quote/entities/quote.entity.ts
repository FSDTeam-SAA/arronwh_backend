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
      fastName: { type: String },
      sureName: { type: String },
      email: { type: String },
      mobleNumber: { type: String },
    },
    required: false,
  })
  personalInfo: {
    title: string;
    fastName: string;
    sureName: string;
    email: string;
    mobleNumber: string;
  };

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Service' })
  serviceId: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'BoilerController' })
  controller: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Extra' })
  extra: Types.ObjectId;

  @Prop()
  surveyData: Date;

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
