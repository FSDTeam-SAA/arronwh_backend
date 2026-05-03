import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PartnerDocument = HydratedDocument<Partner>;

@Schema({ timestamps: true })
export class Partner {
  @Prop()
  excellent: string;

  @Prop()
  title: string;

  @Prop()
  images: string[];
}

export const PartnerSchema = SchemaFactory.createForClass(Partner);
