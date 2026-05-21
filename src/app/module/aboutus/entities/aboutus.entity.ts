import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AboutusDocument = HydratedDocument<Aboutus>;

@Schema({ timestamps: true })
export class Aboutus {
  @Prop({ required: true })
  headerTitle: string;

  @Prop({ required: true })
  headerDescription: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [String], default: [] })
  images: string[];
}

export const AboutusSchema = SchemaFactory.createForClass(Aboutus);