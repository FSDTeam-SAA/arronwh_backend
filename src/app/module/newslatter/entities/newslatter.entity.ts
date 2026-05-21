import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type NewslatterDocument = HydratedDocument<Newslatter>;

@Schema({ timestamps: true })
export class Newslatter {
  @Prop()
  email: string;
}



export const NewslatterSchema = SchemaFactory.createForClass(Newslatter);
