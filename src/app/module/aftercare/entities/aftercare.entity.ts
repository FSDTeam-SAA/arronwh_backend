import { Prop, Schema } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class Aftercare {
  @Prop()
  title: string;

  @Prop()
  subTitle: string;
}


