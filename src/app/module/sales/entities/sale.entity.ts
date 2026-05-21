import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SaleDocument = HydratedDocument<Sale>;

@Schema({ timestamps: true })
export class Sale {
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

export const SaleSchema = SchemaFactory.createForClass(Sale);
