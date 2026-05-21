import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type EngineerDocument = HydratedDocument<Engineer>;

@Schema({ timestamps: true })
export class Engineer {
  @Prop()
  title: string;

  @Prop()
  subTitle: string;

  @Prop()
  dateTime: [
    {
      date: string;
      time: string;
    },
  ];

  @Prop()
  phonenumber: string;

  @Prop()
  description: string;
}

export const EngineerSchema = SchemaFactory.createForClass(Engineer);
