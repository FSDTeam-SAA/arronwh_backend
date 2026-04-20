import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ExtraDocument = HydratedDocument<Extra>;

@Schema({ timestamps: true })
export class Extra {
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

  @Prop({default: false})
  isBestSeller: boolean;
}

export const ExtraSchema = SchemaFactory.createForClass(Extra);
