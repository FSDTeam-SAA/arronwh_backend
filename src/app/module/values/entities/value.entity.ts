import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ValueDocument = HydratedDocument<Value>;
export type ValueDataDocument = HydratedDocument<ValueData>;

@Schema({ timestamps: true })
export class ValueData {
  @Prop()
  image: string;

  @Prop({ trim: true })
  title: string;

  @Prop({ trim: true })
  description: string;
}

export const ValueDataSchema = SchemaFactory.createForClass(ValueData);

@Schema({ timestamps: true })
export class Value {
  @Prop({ required: true, trim: true })
  valueTitle: string;

  @Prop({ required: true, trim: true })
  valueDetail: string;
}

export const ValueSchema = SchemaFactory.createForClass(Value);
