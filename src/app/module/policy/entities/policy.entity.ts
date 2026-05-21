import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PolicyDocument = HydratedDocument<Policy>;

@Schema({ timestamps: true })
export class Policy {
  @Prop()
  title: string;

  @Prop()
  description: string;
}

export const PolicySchema = SchemaFactory.createForClass(Policy);
