import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type IssueDocument = HydratedDocument<Issue>;

@Schema({ timestamps: true })
export class Issue {
  @Prop()
  name?: string;

  @Prop()
  email: string;

  @Prop()
  phone: string;

  @Prop()
  message: string;
}

export const IssueSchema = SchemaFactory.createForClass(Issue);
