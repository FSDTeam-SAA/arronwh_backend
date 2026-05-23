import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type HeadofficeDocument = HydratedDocument<Headoffice>;

@Schema({ timestamps: true })
export class Headoffice {
  @Prop()
  bannerImage: string;

  @Prop()
  header: string;

  @Prop()
  description: string;
}

export const HeadofficeSchema = SchemaFactory.createForClass(Headoffice);
