import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type QuizePriceManagementDocument =
  HydratedDocument<QuizePriceManagement>;

@Schema({ _id: false })
export class QuizePriceValue {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  value: string;
}

const QuizePriceValueSchema =
  SchemaFactory.createForClass(QuizePriceValue);

@Schema({ timestamps: true })
export class QuizePriceManagement {
  @Prop({ required: false, trim: true })
  name: string;

  @Prop({ type: [QuizePriceValueSchema], default: [] })
  value: QuizePriceValue[];
}

export const QuizePriceManagementSchema = SchemaFactory.createForClass(
  QuizePriceManagement,
);
