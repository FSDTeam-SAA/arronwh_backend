import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type ServiceDocument = HydratedDocument<Service>;

class MediaItem {
  @Prop({ required: true })
  url: string;

  @Prop()
  alt: string;

  @Prop({ default: false })
  isPrimary: boolean;

  @Prop({ default: 0 })
  sortOrder: number;
}

class BadgeItem {
  @Prop({ required: true })
  label: string;

  @Prop()
  type: string;

  @Prop()
  color: string;
}

class PriceSummary {
  @Prop({ required: true, default: 0 })
  fullPrice: number;

  @Prop({ default: 0 })
  discountedPrice: number;

  @Prop({ default: 0 })
  discountAmount: number;

  @Prop({ default: 0 })
  discountPercentage: number;

  @Prop({ default: 'GBP' })
  currency: string;

  @Prop()
  vatLabel: string;

  @Prop()
  note: string;
}

class FinancePlan {
  @Prop({ default: false })
  enabled: boolean;

  @Prop()
  monthlyPrice: number;

  @Prop()
  durationMonths: number;

  @Prop()
  apr: number;

  @Prop()
  deposit: number;

  @Prop()
  representativeExample: string;
}

class CtaConfig {
  @Prop()
  primaryText: string;

  @Prop()
  primaryAction: string;

  @Prop()
  secondaryText: string;

  @Prop()
  secondaryAction: string;
}

class HeroSection {
  @Prop()
  eyebrow: string;

  @Prop({ required: true })
  title: string;

  @Prop()
  subtitle: string;

  @Prop({ type: [MediaItem], default: [] })
  gallery: MediaItem[];

  @Prop({ type: [BadgeItem], default: [] })
  badges: BadgeItem[];

  @Prop({ type: PriceSummary, _id: false })
  priceSummary: PriceSummary;

  @Prop({ type: FinancePlan, _id: false })
  financePlan: FinancePlan;

  @Prop({ type: CtaConfig, _id: false })
  cta: CtaConfig;

  @Prop({ type: [String], default: [] })
  paymentMethodIcons: string[];
}

class SpecItem {
  @Prop({ required: true })
  label: string;

  @Prop({ required: true })
  value: string;

  @Prop()
  icon: string;

  @Prop({ default: 0 })
  sortOrder: number;
}

class FeatureHighlightSection {
  @Prop()
  brandLogo: string;

  @Prop()
  partnerLogo: string;

  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop()
  image: string;

  @Prop({ type: [SpecItem], default: [] })
  specifications: SpecItem[];
}

class IncludedItem {
  @Prop({ required: true })
  title: string;

  @Prop()
  shortDescription: string;

  @Prop()
  fullDescription: string;

  @Prop({ default: false })
  isExpandable: boolean;

  @Prop({ default: true })
  isIncluded: boolean;

  @Prop({ default: 0 })
  sortOrder: number;
}

class IncludedSection {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ type: [IncludedItem], default: [] })
  items: IncludedItem[];

  @Prop({ type: [String], default: [] })
  sideImages: string[];
}

class InstallationStep {
  @Prop({ required: true })
  stepNumber: number;

  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop()
  image: string;
}

class InstallationGuideSection {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ type: [InstallationStep], default: [] })
  steps: InstallationStep[];
}

class StickySummaryBar {
  @Prop({ default: true })
  enabled: boolean;

  @Prop()
  title: string;

  @Prop()
  discountedPrice: number;

  @Prop()
  monthlyPrice: number;

  @Prop()
  saveQuoteText: string;

  @Prop()
  chooseText: string;
}

class SeoMeta {
  @Prop()
  metaTitle: string;

  @Prop()
  metaDescription: string;

  @Prop({ type: [String], default: [] })
  keywords: string[];

  @Prop()
  slug: string;
}

@Schema({ timestamps: true })
export class Service {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: mongoose.Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  // @Prop({ required: true, trim: true, unique: true })
  // slug: string;

  @Prop()
  brand: string;

  @Prop()
  category: string;

  @Prop()
  serviceType: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isFeatured: boolean;

  @Prop({
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
  })
  status: string;

  @Prop({ type: HeroSection, _id: false, required: true })
  heroSection: HeroSection;

  @Prop({ type: FeatureHighlightSection, _id: false })
  featureHighlightSection: FeatureHighlightSection;

  @Prop({ type: IncludedSection, _id: false })
  includedSection: IncludedSection;

  @Prop({ type: InstallationGuideSection, _id: false })
  installationGuideSection: InstallationGuideSection;

  @Prop({ type: StickySummaryBar, _id: false })
  stickySummaryBar: StickySummaryBar;

  @Prop({ type: SeoMeta, _id: false })
  seo: SeoMeta;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);