import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

class BoilerFeature {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  value: string;
}

class FeatureInformation {
  @Prop() featureTitle: string;
  @Prop() featureDescription: string;
  @Prop() featureLogo: string[];
}

class InstallationGuideItem {
  @Prop() title: string;
  @Prop() image: string;
}

@Schema({ timestamps: true })
export class Product {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: mongoose.Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true })
  description: string;

  @Prop({ trim: true })
  shortDescription: string;

  @Prop({ type: [String] })
  images: string[];

  @Prop({ type: [String] })
  badges: string[];

  @Prop()
  price: number;

  @Prop()
  discountPrice: number;

  @Prop()
  payablePrice: number;

  @Prop()
  monthlyPrice: number;

  @Prop({ trim: true })
  boilerAbility: string;

  @Prop({ type: [BoilerFeature], _id: false })
  boilerFeatures: BoilerFeature[];

  @Prop({ type: FeatureInformation, _id: false })
  featureInformation: FeatureInformation;

  @Prop({ trim: true })
  boilerIncludedData: string;

  @Prop({ type: [String] })
  includedImages: string[];

  @Prop({ type: [InstallationGuideItem], _id: false })
  boilerInstallationGuide: InstallationGuideItem[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);
