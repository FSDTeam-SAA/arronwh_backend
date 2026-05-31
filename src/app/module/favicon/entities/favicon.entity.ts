import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type FaviconDocument = HydratedDocument<Favicon>;

@Schema({ timestamps: true })
export class Favicon {
  @Prop()
  image: string;
}

export const FaviconSchema = SchemaFactory.createForClass(Favicon);
