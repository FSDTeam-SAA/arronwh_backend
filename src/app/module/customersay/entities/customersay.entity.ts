import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CustomersayDocument = HydratedDocument<Customersay>;

@Schema({ timestamps: true })
export class Customersay {
  @Prop({ trim: true })
  title: string;

  @Prop({ trim: true })
  description: string;

  @Prop({ required: true, trim: true, maxlength: 500 })
  review: string;

  @Prop({ required: true, type: Number, min: 1, max: 5 })
  rating: number;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true })
  location: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const CustomersaySchema = SchemaFactory.createForClass(Customersay);
