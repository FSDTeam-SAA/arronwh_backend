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
import { UpdateServiceDto } from './dto/update-service.dto';
import { UploadedServiceFiles } from './service.controller';

@Injectable()
export class ServiceService {
  constructor(
    @InjectModel(Service.name) private readonly serviceModel: Model<ServiceDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
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

  private normalizeFeatures(value: unknown): CreateServiceDto['features'] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .filter((item) => item && typeof item === 'object')
      .map((item) => ({
        title: String((item as Record<string, unknown>).title ?? '').trim(),
        details: String((item as Record<string, unknown>).details ?? '').trim(),
      }))
      .filter((item) => item.title || item.details);
  }

  private getFirstFile(files?: Express.Multer.File[]): Express.Multer.File | undefined {
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

  async createService(
    userId: string,
    data: string,
    files: UploadedServiceFiles,
  ) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new HttpException('User not found', 404);
    }

    const payload = this.parseJson<CreateServiceDto>(data, {} as CreateServiceDto);

    const [
      images,
      includeImage,
      productLogo,
      authorLogo,
      featureImage,
      installationGuideImage,
    ] = await Promise.all([
      this.uploadMany(files.images),
      this.uploadMany(files.includeImages),
      this.uploadOne(this.getFirstFile(files.productLogo)),
      this.uploadOne(this.getFirstFile(files.authorLogo)),
      this.uploadOne(this.getFirstFile(files.featureImage)),
      this.uploadOne(this.getFirstFile(files.installationGuideImage)),
    ]);

    const createdService = await this.serviceModel.create({
      user: userId,
      title: payload.title?.trim(),
      description: payload.description?.trim(),
      badges: this.normalizeStringArray(payload.badges),
      price: this.normalizeNumber(payload.price),
      discount: this.normalizeNumber(payload.discount),
      images,
      features: this.normalizeFeatures(payload.features),
      featureSectionInformation: {
        title: payload.featureSectionInformation?.title?.trim(),
        description: payload.featureSectionInformation?.description?.trim(),
        productLogo,
        authorLogo,
        featureImage,
      },
      includes: this.normalizeStringArray(payload.includes),
      includeImage,
      installationGuide: payload.installationGuide?.trim(),
      installationGuideImage,
    });

    return createdService;
  }

  async getAllServices(params: IFilterParams, options: IOptions) {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper(options);

    const whereConditions = buildWhereConditions(params, [
      'title',
      'description',
      'features',
      'includes',
      'installationGuide',
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
    updateServiceDto: UpdateServiceDto,
    _files: UploadedServiceFiles,
  ) {
    const service = await this.serviceModel.findById(id);
    if (!service) {
      throw new HttpException('Service not found', 404);
    }

    return this.serviceModel.findByIdAndUpdate(id, updateServiceDto, {
      new: true,
    });
  }
}
