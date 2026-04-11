export class MediaItemDto {
  url?: string;
  alt?: string;
  isPrimary?: boolean;
  sortOrder?: number;
}

export class BadgeItemDto {
  label?: string;
  type?: string;
  color?: string;
}

export class PriceSummaryDto {
  fullPrice?: number;
  discountedPrice?: number;
  discountAmount?: number;
  discountPercentage?: number;
  currency?: string;
  vatLabel?: string;
  note?: string;
}

export class FinancePlanDto {
  enabled?: boolean;
  monthlyPrice?: number;
  durationMonths?: number;
  apr?: number;
  deposit?: number;
  representativeExample?: string;
}

export class CtaConfigDto {
  primaryText?: string;
  primaryAction?: string;
  secondaryText?: string;
  secondaryAction?: string;
}

export class HeroSectionDto {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  gallery?: MediaItemDto[];
  badges?: BadgeItemDto[];
  priceSummary?: PriceSummaryDto;
  financePlan?: FinancePlanDto;
  cta?: CtaConfigDto;
  paymentMethodIcons?: string[];
}

export class SpecItemDto {
  label?: string;
  value?: string;
  icon?: string;
  sortOrder?: number;
}

export class FeatureHighlightSectionDto {
  brandLogo?: string;
  partnerLogo?: string;
  title?: string;
  description?: string;
  image?: string;
  specifications?: SpecItemDto[];
}

export class IncludedItemDto {
  title?: string;
  shortDescription?: string;
  fullDescription?: string;
  isExpandable?: boolean;
  isIncluded?: boolean;
  sortOrder?: number;
}

export class IncludedSectionDto {
  title?: string;
  description?: string;
  items?: IncludedItemDto[];
  sideImages?: string[];
}

export class InstallationStepDto {
  stepNumber?: number;
  title?: string;
  description?: string;
  image?: string;
}

export class InstallationGuideSectionDto {
  title?: string;
  description?: string;
  steps?: InstallationStepDto[];
}

export class StickySummaryBarDto {
  enabled?: boolean;
  title?: string;
  discountedPrice?: number;
  monthlyPrice?: number;
  saveQuoteText?: string;
  chooseText?: string;
}

export class SeoMetaDto {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  slug?: string;
}

export class CreateServiceDto {
  name?: string;
  // slug?: string;
  brand?: string;
  category?: string;
  serviceType?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  status?: 'draft' | 'published' | 'archived';
  heroSection?: HeroSectionDto;
  featureHighlightSection?: FeatureHighlightSectionDto;
  includedSection?: IncludedSectionDto;
  installationGuideSection?: InstallationGuideSectionDto;
  stickySummaryBar?: StickySummaryBarDto;
  seo?: SeoMetaDto;
}
