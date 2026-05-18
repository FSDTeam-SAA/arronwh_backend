import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type LogoDocument = HydratedDocument<Logo>;

@Schema({ timestamps: true })
export class Logo {
  @Prop()
  image: string;
}

export const LogoSchema = SchemaFactory.createForClass(Logo);
