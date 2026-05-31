import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BannerDocument = HydratedDocument<Banner>;

@Schema({ timestamps: true })
export class Banner {
  @Prop()
  firstTitle: string;

  @Prop()
  secondTitle: string;

  @Prop()
  subTitle: string;

  @Prop()
  feature: string[];

  @Prop()
  image: string;

  @Prop()
  imageText: string;

  @Prop()
  backgroundColor: string;

  @Prop()
  textColor: string;

  @Prop()
  buttonText?: string;
}

export const BannerSchema = SchemaFactory.createForClass(Banner);
