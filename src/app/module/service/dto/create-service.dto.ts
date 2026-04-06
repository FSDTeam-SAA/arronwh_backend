export class FeatureItemDto {
  title?: string;
  details?: string;
}

export class FeatureSectionDto {
  title?: string;
  description?: string;
  productLogo?: string;
  authorLogo?: string;
  featureImage?: string;
}

export class CreateServiceDto {
  title?: string;
  description?: string;
  badges?: string[];
  price?: number;
  discount?: number;
  images?: string[];
  features?: FeatureItemDto[];
  featureSectionInformation?: FeatureSectionDto;
  includes?: string[];
  includeImage?: string[];
  installationGuide?: string;
  installationGuideImage?: string;
}
