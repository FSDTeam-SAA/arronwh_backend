import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TermsconditionDocument = HydratedDocument<Termscondition>;

@Schema({ timestamps: true })
export class Termscondition {
  @Prop()
  title: string;

  @Prop()
  subtitle: string;

  @Prop()
  description: string;
}

export const TermsconditionSchema =
  SchemaFactory.createForClass(Termscondition);
