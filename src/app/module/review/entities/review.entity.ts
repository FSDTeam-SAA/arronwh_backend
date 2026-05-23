import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ReviewDocument = HydratedDocument<Review>;

@Schema({ timestamps: true })
export class Review {
  @Prop({ trim: true })
  title?: string;

  @Prop({ trim: true })
  subtitle?: string;

  @Prop({ required: true, trim: true, maxlength: 500 })
  review: string;

  @Prop({ required: true, type: Number, min: 1, max: 5 })
  rating: number;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  location: string;

  @Prop()
  video?: string;

  @Prop()
  videoPublicId?: string;

  @Prop({ default: true })
  isVerified: boolean;

  @Prop({ default: true })
  isActive: boolean;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
