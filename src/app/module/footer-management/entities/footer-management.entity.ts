import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type FooterManagementDocument = HydratedDocument<FooterManagement>;

@Schema({ timestamps: true })
export class FooterManagement {
  @Prop({ required: true, trim: true })
  location: string;

  @Prop({ required: true, trim: true })
  email: string;

  @Prop({ required: true, trim: true })
  phone: string;

  @Prop({ required: true, trim: true })
  reviewDescription: string;
}

export const FooterManagementSchema =
  SchemaFactory.createForClass(FooterManagement);
