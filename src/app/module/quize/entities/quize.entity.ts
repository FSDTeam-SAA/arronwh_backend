import { Prop, Schema } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema({
  timestamps: true,
})
export class Quize {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Service' })
  service: mongoose.Types.ObjectId;

  @Prop({
    type: [
      {
        title: String,
        options: String,
        image: String,
      },
    ],
  })
  management: Array<{
    title: string;
    options: string;
    image: string;
  }>;
}
