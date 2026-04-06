import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BoilerControllerDocument = HydratedDocument<BoilerController>;

@Schema({ timestamps: true })
export class BoilerController {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ type: [String], default: [] })
  badges: string[];

  @Prop({ required: true })
  price: number;

  @Prop({ default: 0 })
  discount: number;

  @Prop({ type: [String], default: [] })
  images: string[];
}

export const BoilerControllerSchema =
  SchemaFactory.createForClass(BoilerController);