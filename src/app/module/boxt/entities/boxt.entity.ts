import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BoxtDocument = HydratedDocument<Boxt>;

@Schema({ timestamps: true })
export class Boxt {
  @Prop()
  title: string;

  @Prop()
  description: string;

  @Prop()
  image: string;

  @Prop()
  backgroundcolor: string;

  @Prop()
  textcolor: string;
}

export const BoxtSchema = SchemaFactory.createForClass(Boxt);
