import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SocialpartershipDocument = HydratedDocument<Socialpartership>;

@Schema({ timestamps: true })
export class Socialpartership {
  @Prop()
  title: string;

  @Prop()
  subTitle: string;

  @Prop()
  socialLink: [
    {
      icon: string;
      iconPublicId: string;
      link: string;
    },
  ];

  @Prop()
  email: string;

  @Prop()
  backgroundColor: string;

  @Prop()
  textColor: string;
}

export const SocialpartershipSchema =
  SchemaFactory.createForClass(Socialpartership);
