import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type YoloheatDocument = HydratedDocument<Yoloheat>;

@Schema({ timestamps: true })
export class Yoloheat {
  @Prop()
  heder: string;

  @Prop()
  hederDiscription: string;

  @Prop()
  image: string;

  @Prop()
  title: string;

  @Prop()
  discription: string;
}

export const YoloheatSchema = SchemaFactory.createForClass(Yoloheat);
