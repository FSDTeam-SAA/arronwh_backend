import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { HydratedDocument } from 'mongoose';

export type ServiceDocument = HydratedDocument<Service>;

class ServiceFeature {
  @Prop()
  title: string;

  @Prop()
  details: string;
}

class FeatureSectionInformation {
  @Prop()
  title: string;

  @Prop()
  description: string;

  @Prop()
  productLogo: string;

  @Prop()
  authorLogo: string;

  @Prop()
  featureImage: string;
}

@Schema({ timestamps: true })
export class Service {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: mongoose.Types.ObjectId;

  @Prop()
  title: string;

  @Prop()
  description: string;

  @Prop()
  badges: [string];

  @Prop()
  price: number;

  @Prop()
  discount: number;

  @Prop()
  images: [string];

  @Prop({ type: [ServiceFeature], _id: false })
  features: ServiceFeature[];

  @Prop({ type: FeatureSectionInformation, _id: false })
  featureSectionInformation: FeatureSectionInformation;

  @Prop()
  includes: [string];

  @Prop()
  includeImage: [string];

  @Prop()
  installationGuide: string;

  @Prop()
  installationGuideImage: string;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);
