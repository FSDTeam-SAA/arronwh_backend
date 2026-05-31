import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AftercareDocument = HydratedDocument<Aftercare>;

@Schema({ timestamps: true })
export class Aftercare {
  @Prop()
  title: string;

  @Prop()
  subTitle: string;
}

export const AftercareSchema = SchemaFactory.createForClass(Aftercare);
