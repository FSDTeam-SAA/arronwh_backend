import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateServiceDto } from './dto/create-service.dto';
import { Service, ServiceDocument } from './entities/service.entity';
import { User, UserDocument } from '../user/entities/user.entity';
import { fileUpload } from 'src/app/helpers/fileUploder';
import { IFilterParams } from 'src/app/helpers/pick';
import paginationHelper, { IOptions } from 'src/app/helpers/pagenation';
import buildWhereConditions from 'src/app/helpers/buildWhereConditions';
import { UploadedServiceFiles } from './service.controller';

@Injectable()
export class ServiceService {
  constructor(
    @InjectModel(Service.name)
    private readonly serviceModel: Model<ServiceDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  private parseJson<T>(value: string | undefined, fallback: T): T {
    if (!value) {
      return fallback;
    }

    try {
      return JSON.parse(value) as T;
    } catch {
      throw new HttpException('Invalid JSON in data field', 400);
    }
  }

  private normalizeString(value: unknown): string {
    if (value === undefined || value === null) {
      return '';
    }

    return String(value).trim();
  }

  private normalizeOptionalString(value: unknown): string | undefined {
    const normalized = this.normalizeString(value);
    return normalized || undefined;
  }

  private normalizeStringArray(value: unknown): string[] {
    if (!value) {
      return [];
    }

    if (Array.isArray(value)) {
      return value.map((item) => String(item).trim()).filter(Boolean);
    }

    if (typeof value === 'string') {
      return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return [String(value).trim()].filter(Boolean);
  }

  private normalizeNumber(value: unknown): number | undefined {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    const parsedValue = Number(value);
    if (Number.isNaN(parsedValue)) {
      throw new HttpException('Invalid number provided', 400);
    }

    return parsedValue;
  }

  private normalizeBoolean(value: unknown): boolean | undefined {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();

      if (normalized === 'true') {
        return true;
      }

      if (normalized === 'false') {
        return false;
      }
    }

    throw new HttpException('Invalid boolean provided', 400);
  }

  private getFirstFile(
    files?: Express.Multer.File[],
  ): Express.Multer.File | undefined {
    return files?.find((file) => file?.buffer?.length);
  }

  private getValidFiles(files?: Express.Multer.File[]): Express.Multer.File[] {
    return files?.filter((file) => file?.buffer?.length) ?? [];
  }

  private async uploadOne(file?: Express.Multer.File): Promise<string> {
    if (!file) {
      return '';
    }

    return (await fileUpload.uploadToCloudinary(file)).url;
  }

  private async uploadMany(files?: Express.Multer.File[]): Promise<string[]> {
    const validFiles = this.getValidFiles(files);
    if (!validFiles.length) {
      return [];
    }

    const uploads = await Promise.all(
      validFiles.map((file) => fileUpload.uploadToCloudinary(file)),
    );

    return uploads.map((upload) => upload.url);
  }

  private normalizeGallery(
    gallery:
      | NonNullable<CreateServiceDto['heroSection']>['gallery']
      | undefined,
    uploadedImages: string[],
  ) {
    const normalizedGallery =
      Array.isArray(gallery) && gallery.length
        ? gallery.map((item, index) => ({
            url:
              this.normalizeOptionalString(item?.url) ||
              uploadedImages[index] ||
              '',
            alt: this.normalizeOptionalString(item?.alt) || '',
            isPrimary: Boolean(item?.isPrimary),
            sortOrder: this.normalizeNumber(item?.sortOrder) ?? index,
          }))
        : uploadedImages.map((url, index) => ({
            url,
            alt: '',
            isPrimary: index === 0,
            sortOrder: index,
          }));

    return normalizedGallery.filter((item) => item.url);
  }

  private normalizeBadges(
    badges: NonNullable<CreateServiceDto['heroSection']>['badges'] | undefined,
  ) {
    if (!Array.isArray(badges)) {
      return [];
    }

    return badges
      .filter((item) => item && typeof item === 'object')
      .map((item) => ({
        label: this.normalizeString(item?.label),
        type: this.normalizeOptionalString(item?.type) || '',
        color: this.normalizeOptionalString(item?.color) || '',
      }))
      .filter((item) => item.label);
  }

  private normalizeSpecifications(
    specifications:
      | NonNullable<
          CreateServiceDto['featureHighlightSection']
        >['specifications']
      | undefined,
  ) {
    if (!Array.isArray(specifications)) {
      return [];
    }

    return specifications
      .filter((item) => item && typeof item === 'object')
      .map((item, index) => ({
        label: this.normalizeString(item?.label),
        value: this.normalizeString(item?.value),
        icon: this.normalizeOptionalString(item?.icon) || '',
        sortOrder: this.normalizeNumber(item?.sortOrder) ?? index,
      }))
      .filter((item) => item.label && item.value);
  }

  private normalizeIncludedItems(
    items:
      | NonNullable<CreateServiceDto['includedSection']>['items']
      | undefined,
  ) {
    if (!Array.isArray(items)) {
      return [];
    }

    return items
      .filter((item) => item && typeof item === 'object')
      .map((item, index) => ({
        title: this.normalizeString(item?.title),
        shortDescription:
          this.normalizeOptionalString(item?.shortDescription) || '',
        fullDescription:
          this.normalizeOptionalString(item?.fullDescription) || '',
        isExpandable: this.normalizeBoolean(item?.isExpandable) ?? false,
        isIncluded: this.normalizeBoolean(item?.isIncluded) ?? true,
        sortOrder: this.normalizeNumber(item?.sortOrder) ?? index,
      }))
      .filter((item) => item.title);
  }

  private normalizeInstallationSteps(
    steps:
      | NonNullable<CreateServiceDto['installationGuideSection']>['steps']
      | undefined,
    uploadedImages: string[],
  ) {
    if (!Array.isArray(steps)) {
      return uploadedImages.map((url, index) => ({
        stepNumber: index + 1,
        title: `Step ${index + 1}`,
        description: '',
        image: url,
      }));
    }

    return steps
      .filter((item) => item && typeof item === 'object')
      .map((item, index) => ({
        stepNumber: this.normalizeNumber(item?.stepNumber) ?? index + 1,
        title: this.normalizeString(item?.title) || `Step ${index + 1}`,
        description: this.normalizeOptionalString(item?.description) || '',
        image:
          this.normalizeOptionalString(item?.image) ||
          uploadedImages[index] ||
          '',
      }));
  }

  private buildCreateOrUpdatePayload(
    payload: CreateServiceDto,
    uploads: {
      heroGallery: string[];
      brandLogo: string;
      partnerLogo: string;
      featureImage: string;
      includedSectionImages: string[];
      installationStepImages: string[];
    },
  ) {
    return {
      name: this.normalizeOptionalString(payload.name),
      // slug:
      //   this.normalizeOptionalString(payload.slug) ||
      //   this.normalizeOptionalString(payload.seo?.slug),
      brand: this.normalizeOptionalString(payload.brand),
      category: this.normalizeOptionalString(payload.category),
      serviceType: this.normalizeOptionalString(payload.serviceType),
      isActive: this.normalizeBoolean(payload.isActive),
      isFeatured: this.normalizeBoolean(payload.isFeatured),
      status: payload.status || undefined,

      heroSection: payload.heroSection
        ? {
            eyebrow: this.normalizeOptionalString(payload.heroSection.eyebrow),
            title: this.normalizeOptionalString(payload.heroSection.title),
            subtitle: this.normalizeOptionalString(
              payload.heroSection.subtitle,
            ),
            gallery: this.normalizeGallery(
              payload.heroSection.gallery,
              uploads.heroGallery,
            ),
            badges: this.normalizeBadges(payload.heroSection.badges),
            priceSummary: payload.heroSection.priceSummary
              ? {
                  fullPrice:
                    this.normalizeNumber(
                      payload.heroSection.priceSummary.fullPrice,
                    ) ?? 0,
                  discountedPrice:
                    this.normalizeNumber(
                      payload.heroSection.priceSummary.discountedPrice,
                    ) ?? 0,
                  discountAmount:
                    this.normalizeNumber(
                      payload.heroSection.priceSummary.discountAmount,
                    ) ?? 0,
                  discountPercentage:
                    this.normalizeNumber(
                      payload.heroSection.priceSummary.discountPercentage,
                    ) ?? 0,
                  currency:
                    this.normalizeOptionalString(
                      payload.heroSection.priceSummary.currency,
                    ) || 'GBP',
                  vatLabel: this.normalizeOptionalString(
                    payload.heroSection.priceSummary.vatLabel,
                  ),
                  note: this.normalizeOptionalString(
                    payload.heroSection.priceSummary.note,
                  ),
                }
              : undefined,
            financePlan: payload.heroSection.financePlan
              ? {
                  enabled:
                    this.normalizeBoolean(
                      payload.heroSection.financePlan.enabled,
                    ) ?? false,
                  monthlyPrice: this.normalizeNumber(
                    payload.heroSection.financePlan.monthlyPrice,
                  ),
                  durationMonths: this.normalizeNumber(
                    payload.heroSection.financePlan.durationMonths,
                  ),
                  apr: this.normalizeNumber(
                    payload.heroSection.financePlan.apr,
                  ),
                  deposit: this.normalizeNumber(
                    payload.heroSection.financePlan.deposit,
                  ),
                  representativeExample: this.normalizeOptionalString(
                    payload.heroSection.financePlan.representativeExample,
                  ),
                }
              : undefined,
            cta: payload.heroSection.cta
              ? {
                  primaryText: this.normalizeOptionalString(
                    payload.heroSection.cta.primaryText,
                  ),
                  primaryAction: this.normalizeOptionalString(
                    payload.heroSection.cta.primaryAction,
                  ),
                  secondaryText: this.normalizeOptionalString(
                    payload.heroSection.cta.secondaryText,
                  ),
                  secondaryAction: this.normalizeOptionalString(
                    payload.heroSection.cta.secondaryAction,
                  ),
                }
              : undefined,
            paymentMethodIcons: this.normalizeStringArray(
              payload.heroSection.paymentMethodIcons,
            ),
          }
        : undefined,

      featureHighlightSection: payload.featureHighlightSection
        ? {
            brandLogo:
              uploads.brandLogo ||
              this.normalizeOptionalString(
                payload.featureHighlightSection.brandLogo,
              ),
            partnerLogo:
              uploads.partnerLogo ||
              this.normalizeOptionalString(
                payload.featureHighlightSection.partnerLogo,
              ),
            title: this.normalizeOptionalString(
              payload.featureHighlightSection.title,
            ),
            description: this.normalizeOptionalString(
              payload.featureHighlightSection.description,
            ),
            image:
              uploads.featureImage ||
              this.normalizeOptionalString(
                payload.featureHighlightSection.image,
              ),
            specifications: this.normalizeSpecifications(
              payload.featureHighlightSection.specifications,
            ),
          }
        : undefined,

      includedSection: payload.includedSection
        ? {
            title: this.normalizeOptionalString(payload.includedSection.title),
            description: this.normalizeOptionalString(
              payload.includedSection.description,
            ),
            items: this.normalizeIncludedItems(payload.includedSection.items),
            sideImages:
              uploads.includedSectionImages.length > 0
                ? uploads.includedSectionImages
                : this.normalizeStringArray(payload.includedSection.sideImages),
          }
        : undefined,

      installationGuideSection: payload.installationGuideSection
        ? {
            title: this.normalizeOptionalString(
              payload.installationGuideSection.title,
            ),
            description: this.normalizeOptionalString(
              payload.installationGuideSection.description,
            ),
            steps: this.normalizeInstallationSteps(
              payload.installationGuideSection.steps,
              uploads.installationStepImages,
            ),
          }
        : undefined,

      stickySummaryBar: payload.stickySummaryBar
        ? {
            enabled:
              this.normalizeBoolean(payload.stickySummaryBar.enabled) ?? true,
            title: this.normalizeOptionalString(payload.stickySummaryBar.title),
            discountedPrice: this.normalizeNumber(
              payload.stickySummaryBar.discountedPrice,
            ),
            monthlyPrice: this.normalizeNumber(
              payload.stickySummaryBar.monthlyPrice,
            ),
            saveQuoteText: this.normalizeOptionalString(
              payload.stickySummaryBar.saveQuoteText,
            ),
            chooseText: this.normalizeOptionalString(
              payload.stickySummaryBar.chooseText,
            ),
          }
        : undefined,

      seo: payload.seo
        ? {
            metaTitle: this.normalizeOptionalString(payload.seo.metaTitle),
            metaDescription: this.normalizeOptionalString(
              payload.seo.metaDescription,
            ),
            keywords: this.normalizeStringArray(payload.seo.keywords),
            slug: this.normalizeOptionalString(payload.seo.slug),
          }
        : undefined,
    };
  }

  private removeUndefinedDeep(obj: Record<string, unknown>) {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => {
          if (
            value &&
            typeof value === 'object' &&
            !Array.isArray(value) &&
            !(value instanceof Date)
          ) {
            return [
              key,
              this.removeUndefinedDeep(value as Record<string, unknown>),
            ];
          }

          return [key, value];
        }),
    );
  }

  async createService(
    userId: string,
    data: string,
    files: UploadedServiceFiles,
  ) {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new HttpException('User not found', 404);
    }

    const payload = this.parseJson<CreateServiceDto>(
      data,
      {} as CreateServiceDto,
    );

    const [
      heroGallery,
      brandLogo,
      partnerLogo,
      featureImage,
      includedSectionImages,
      installationStepImages,
    ] = await Promise.all([
      this.uploadMany(files.heroGallery),
      this.uploadOne(this.getFirstFile(files.brandLogo)),
      this.uploadOne(this.getFirstFile(files.partnerLogo)),
      this.uploadOne(this.getFirstFile(files.featureImage)),
      this.uploadMany(files.includedSectionImages),
      this.uploadMany(files.installationStepImages),
    ]);

    const normalizedPayload = this.buildCreateOrUpdatePayload(payload, {
      heroGallery,
      brandLogo,
      partnerLogo,
      featureImage,
      includedSectionImages,
      installationStepImages,
    });

    if (!normalizedPayload.name) {
      throw new HttpException('Service name is required', 400);
    }

    // if (!normalizedPayload.slug) {
    //   throw new HttpException('Service slug is required', 400);
    // }

    if (!normalizedPayload.heroSection?.title) {
      throw new HttpException('heroSection.title is required', 400);
    }

    const createdService = await this.serviceModel.create({
      user: userId,
      ...this.removeUndefinedDeep(normalizedPayload),
    });

    return createdService;
  }

  async getAllServices(params: IFilterParams, options: IOptions) {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper(options);

    const whereConditions = buildWhereConditions(params, [
      'name',
      'brand',
      'category',
      'serviceType',
      'status',
      'heroSection.title',
      'heroSection.subtitle',
      'featureHighlightSection.title',
      'includedSection.title',
      'installationGuideSection.title',
    ]);

    const total = await this.serviceModel.countDocuments(whereConditions);

    const data = await this.serviceModel
      .find(whereConditions)
      .sort({ [sortBy]: sortOrder } as never)
      .skip(skip)
      .limit(limit)
      .populate('user', 'fullName email');

    return {
      meta: {
        total,
        page,
        limit,
      },
      data,
    };
  }

  async getServiceById(id: string) {
    const service = await this.serviceModel
      .findById(id)
      .populate('user', 'fullName email');

    if (!service) {
      throw new HttpException('Service not found', 404);
    }

    return service;
  }

  async deleteServiceById(id: string) {
    const service = await this.serviceModel.findById(id);

    if (!service) {
      throw new HttpException('Service not found', 404);
    }

    return service.deleteOne();
  }

  async updateServiceById(
    id: string,
    data: string,
    files: UploadedServiceFiles,
  ) {
    const service = await this.serviceModel.findById(id);

    if (!service) {
      throw new HttpException('Service not found', 404);
    }

    const payload = this.parseJson<CreateServiceDto>(
      data,
      {} as CreateServiceDto,
    );

    const [
      heroGallery,
      brandLogo,
      partnerLogo,
      featureImage,
      includedSectionImages,
      installationStepImages,
    ] = await Promise.all([
      this.uploadMany(files.heroGallery),
      this.uploadOne(this.getFirstFile(files.brandLogo)),
      this.uploadOne(this.getFirstFile(files.partnerLogo)),
      this.uploadOne(this.getFirstFile(files.featureImage)),
      this.uploadMany(files.includedSectionImages),
      this.uploadMany(files.installationStepImages),
    ]);

    const normalizedPayload = this.buildCreateOrUpdatePayload(payload, {
      heroGallery,
      brandLogo,
      partnerLogo,
      featureImage,
      includedSectionImages,
      installationStepImages,
    });

    const cleanedPayload = this.removeUndefinedDeep(normalizedPayload);

    return this.serviceModel.findByIdAndUpdate(id, cleanedPayload, {
      new: true,
      runValidators: true,
    });
  }
}
