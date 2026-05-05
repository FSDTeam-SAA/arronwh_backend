import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type YoloheatDocument = HydratedDocument<Yoloheat>;
export type HeaderDataDocument = HydratedDocument<HeaderData>;

@Schema({ _id: true })
export class HeaderData {
  @Prop()
  headerTitle: string;

  @Prop()
  headerDiscription: string;
}

export const HeaderDataSchema = SchemaFactory.createForClass(HeaderData);

@Schema({ timestamps: true })
export class Yoloheat {
  @Prop()
  image: string;

  @Prop()
  title: string;

  @Prop()
  discription: string;
}

export const YoloheatSchema = SchemaFactory.createForClass(Yoloheat);
