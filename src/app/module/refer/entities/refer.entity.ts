import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ReferDocument = HydratedDocument<Refer>;

@Schema({ timestamps: true })
export class Refer {
  @Prop()
  referred_by: string;

  @Prop()
  name: string;

  @Prop()
  email: string;

  @Prop()
  phone: string;

  @Prop()
  postcode: string;

  @Prop()
  address: string;

  @Prop()
  message: string;
}

export const ReferSchema = SchemaFactory.createForClass(Refer);
