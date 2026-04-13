import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../user/entities/user.entity';
import { fileUpload } from 'src/app/helpers/fileUploder';
import { IFilterParams } from 'src/app/helpers/pick';
import paginationHelper, { IOptions } from 'src/app/helpers/pagenation';
import buildWhereConditions from 'src/app/helpers/buildWhereConditions';
import { Product, ProductDocument } from './entitiy/product.entitiy';
import { CreateProductDto } from './dto/create.dto';
import { UpdateProductDto } from './dto/update.dto';

export type UploadedProductFiles = {
  images?: Express.Multer.File[];
  includedImages?: Express.Multer.File[];
  featureLogo?: Express.Multer.File[];
  installationGuideImages?: Express.Multer.File[];
};

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  private parseJson<T>(value: string | undefined, fallback: T): T {
    if (!value) return fallback;
    try {
      return JSON.parse(value) as T;
    } catch {
      throw new HttpException('Invalid JSON in data field', 400);
    }
  }

  private normalizeStringArray(value: unknown): string[] {
    if (!value) return [];
    if (Array.isArray(value)) return value.map(String).filter(Boolean);
    if (typeof value === 'string')
      return value
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    return [String(value)].filter(Boolean);
  }

  private normalizeNumber(value: unknown): number | undefined {
    if (value === undefined || value === null || value === '') return undefined;
    const n = Number(value);
    if (Number.isNaN(n))
      throw new HttpException('Invalid number provided', 400);
    return n;
  }

  private getFirstFile(files?: Express.Multer.File[]) {
    return files?.find((f) => f?.buffer?.length);
  }

  private getValidFiles(files?: Express.Multer.File[]) {
    return files?.filter((f) => f?.buffer?.length) ?? [];
  }

  private async uploadOne(file?: Express.Multer.File): Promise<string> {
    if (!file) return '';
    return (await fileUpload.uploadToCloudinary(file)).url;
  }

  private async uploadMany(files?: Express.Multer.File[]): Promise<string[]> {
    const valid = this.getValidFiles(files);
    if (!valid.length) return [];
    return Promise.all(
      valid.map((f) => fileUpload.uploadToCloudinary(f).then((r) => r.url)),
    );
  }

  async createProduct(
    userId: string,
    data: string,
    files: UploadedProductFiles,
  ) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new HttpException('User not found', 404);

    const payload = this.parseJson<CreateProductDto>(
      data,
      {} as CreateProductDto,
    );

    const [images, includedImages, featureLogo] = await Promise.all([
      this.uploadMany(files.images),
      this.uploadMany(files.includedImages),
      this.uploadMany(files.featureLogo),
    ]);

    // Handle boilerInstallationGuide images — merge uploaded images with guide items
    const guideItems = Array.isArray(payload.boilerInstallationGuide)
      ? payload.boilerInstallationGuide
      : [];
    const guideImageFiles = this.getValidFiles(files.installationGuideImages);
    const guideImageUrls = await this.uploadMany(guideImageFiles);
    const boilerInstallationGuide = guideItems.map((item, i) => ({
      title: item.title?.trim() ?? '',
      image: guideImageUrls[i] ?? item.image ?? '',
    }));

    return this.productModel.create({
      user: userId,
      title: payload.title?.trim(),
      description: payload.description?.trim(),
      shortDescription: payload.shortDescription?.trim(),
      images,
      badges: this.normalizeStringArray(payload.badges),
      price: this.normalizeNumber(payload.price),
      discountPrice: this.normalizeNumber(payload.discountPrice),
      payablePrice: this.normalizeNumber(payload.payablePrice),
      monthlyPrice: this.normalizeNumber(payload.monthlyPrice),
      boilerAbility: payload.boilerAbility?.trim(),
      boilerFeatures: Array.isArray(payload.boilerFeatures)
        ? payload.boilerFeatures
            .filter((f) => f.title?.trim() && f.value?.trim())
            .map((f) => ({ title: f.title.trim(), value: f.value.trim() }))
        : [],
      featureInformation: {
        featureTitle: payload.featureInformation?.featureTitle?.trim(),
        featureDescription:
          payload.featureInformation?.featureDescription?.trim(),
        featureLogo,
      },
      boilerIncludedData: payload.boilerIncludedData?.trim(),
      includedImages,
      boilerInstallationGuide,
    });
  }

  async getAllProducts(params: IFilterParams, options: IOptions) {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper(options);
    const whereConditions = buildWhereConditions(params, [
      'title',
      'description',
      'shortDescription',
      'boilerAbility',
      'boilerIncludedData',
    ]);
    const [total, data] = await Promise.all([
      this.productModel.countDocuments(whereConditions),
      this.productModel
        .find(whereConditions)
        .sort({ [sortBy]: sortOrder } as never)
        .skip(skip)
        .limit(limit)
        .populate('user', 'fullName email'),
    ]);
    return { meta: { total, page, limit }, data };
  }

  async getProductById(id: string) {
    const product = await this.productModel
      .findById(id)
      .populate('user', 'fullName email');
    if (!product) throw new HttpException('Product not found', 404);
    return product;
  }

  async updateProductById(id: string, dto: UpdateProductDto) {
    const product = await this.productModel.findById(id);
    if (!product) throw new HttpException('Product not found', 404);
    return this.productModel.findByIdAndUpdate(id, dto, { new: true });
  }

  async deleteProductById(id: string) {
    const product = await this.productModel.findById(id);
    if (!product) throw new HttpException('Product not found', 404);
    return product.deleteOne();
  }
}
