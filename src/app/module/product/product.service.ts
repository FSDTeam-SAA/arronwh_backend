<<<<<<< HEAD
import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../user/entities/user.entity';
import { fileUpload } from 'src/app/helpers/fileUploder';
import { IFilterParams } from 'src/app/helpers/pick';
import paginationHelper, { IOptions } from 'src/app/helpers/pagenation';
import buildWhereConditions from 'src/app/helpers/buildWhereConditions';
import { Product, ProductDocument } from './entitiy/product.entitiy';
import { CreateProductDto } from './dto/create.dto';
import { UpdateProductDto } from './dto/update.dto';
import { Quote, QuoteDocument } from '../quote/entities/quote.entity';
import { Booking, BookingDocument } from '../booking/entities/booking.entity';

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
    @InjectModel(Quote.name) private readonly quoteModel: Model<QuoteDocument>,
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
  ) {}

  private async getBookingCountMap(
    quoteField: 'productId' | 'controller' | 'extra',
  ): Promise<Map<string, number>> {
    const bookingCounts = await this.bookingModel.aggregate([
      {
        $lookup: {
          from: this.quoteModel.collection.name,
          localField: 'quote',
          foreignField: '_id',
          as: 'quoteData',
        },
      },
      { $unwind: '$quoteData' },
      {
        $match: {
          [`quoteData.${quoteField}`]: {
            $exists: true,
            $ne: null,
          },
        },
      },
      {
        $group: {
          _id: `$quoteData.${quoteField}`,
          bookingCount: { $sum: 1 },
        },
      },
    ]);

    return new Map(
      bookingCounts.map((item) => [String(item._id), Number(item.bookingCount)]),
    );
  }

  private compareValues(a: unknown, b: unknown, sortOrder: string) {
    const direction = sortOrder === 'asc' ? 1 : -1;

    if (a instanceof Date && b instanceof Date) {
      return (a.getTime() - b.getTime()) * direction;
    }

    if (typeof a === 'number' && typeof b === 'number') {
      return (a - b) * direction;
    }

    return String(a ?? '').localeCompare(String(b ?? '')) * direction;
  }

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

    const payablePrice = payload.price && payload.discountPrice ? payload.price - payload.discountPrice : undefined;
    const monthlyPrice = payablePrice ? parseFloat((payablePrice / 12).toFixed(2)) : undefined;

    return this.productModel.create({
      user: userId,
      title: payload.title?.trim(),
      description: payload.description?.trim(),
      shortDescription: payload.shortDescription?.trim(),
      images,
      badges: this.normalizeStringArray(payload.badges),
      price: this.normalizeNumber(payload.price),
      discountPrice: this.normalizeNumber(payload.discountPrice),
      payablePrice: payablePrice,
      monthlyPrice: monthlyPrice,
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
    const [total, products, bookingCountMap] = await Promise.all([
      this.productModel.countDocuments(whereConditions),
      this.productModel
        .find(whereConditions)
        .lean()
        .populate('user', 'fullName email'),
      this.getBookingCountMap('productId'),
    ]);

    const highestBookingCount = products.reduce((max, product) => {
      const bookingCount = bookingCountMap.get(String(product._id)) ?? 0;
      return Math.max(max, bookingCount);
    }, 0);

    const rankedProducts = products
      .map((product) => {
        const bookingCount = bookingCountMap.get(String(product._id)) ?? 0;
        return {
          ...product,
          bookingCount,
          isBestSeller:
            highestBookingCount > 0 && bookingCount === highestBookingCount,
        };
      })
      .sort((a, b) => {
        if (b.bookingCount !== a.bookingCount) {
          return b.bookingCount - a.bookingCount;
        }

        return this.compareValues(
          a[sortBy as keyof typeof a],
          b[sortBy as keyof typeof b],
          sortOrder,
        );
      });

    return {
      meta: { total, page, limit },
      data: rankedProducts.slice(skip, skip + limit),
    };
  }

  async getProductById(id: string) {
    const product = await this.productModel
      .findById(id)
      .populate('user', 'fullName email');
    if (!product) throw new HttpException('Product not found', 404);
    return product;
  }

  // async updateProductById(id: string, dto: UpdateProductDto) {
  //   const product = await this.productModel.findById(id);
  //   if (!product) throw new HttpException('Product not found', 404);
  //   return this.productModel.findByIdAndUpdate(id, dto, { new: true });
  // }
  async updateProductById(
  id: string,
  data: string,
  files: UploadedProductFiles,
) {
  const product = await this.productModel.findById(id);
  if (!product) throw new HttpException('Product not found', 404);

  const payload = this.parseJson<UpdateProductDto>(data, {} as UpdateProductDto);

  // Upload new images only if provided, otherwise keep existing
  const [images, includedImages, featureLogo] = await Promise.all([
    files.images?.length ? this.uploadMany(files.images) : Promise.resolve(undefined),
    files.includedImages?.length ? this.uploadMany(files.includedImages) : Promise.resolve(undefined),
    files.featureLogo?.length ? this.uploadMany(files.featureLogo) : Promise.resolve(undefined),
  ]);

  // Handle boilerInstallationGuide — upload new images if provided
  let boilerInstallationGuide: { title: string; image: string }[] | undefined;
  if (Array.isArray(payload.boilerInstallationGuide)) {
    const guideImageFiles = this.getValidFiles(files.installationGuideImages);
    const guideImageUrls = await this.uploadMany(guideImageFiles);
    boilerInstallationGuide = payload.boilerInstallationGuide.map((item, i) => ({
      title: item.title?.trim() ?? '',
      image: guideImageUrls[i] ?? item.image ?? '',
    }));
  }

  // Build update payload — only include fields that were actually sent
  const updateData: Record<string, unknown> = {};

  if (payload.title !== undefined) updateData.title = payload.title.trim();
  if (payload.description !== undefined) updateData.description = payload.description.trim();
  if (payload.shortDescription !== undefined) updateData.shortDescription = payload.shortDescription.trim();
  if (payload.boilerAbility !== undefined) updateData.boilerAbility = payload.boilerAbility.trim();
  if (payload.boilerIncludedData !== undefined) updateData.boilerIncludedData = payload.boilerIncludedData.trim();
  if (payload.badges !== undefined) updateData.badges = this.normalizeStringArray(payload.badges);
  if (payload.price !== undefined) updateData.price = this.normalizeNumber(payload.price);
  if (payload.discountPrice !== undefined) updateData.discountPrice = this.normalizeNumber(payload.discountPrice);
  if (payload.monthlyPrice !== undefined) updateData.monthlyPrice = this.normalizeNumber(payload.monthlyPrice);

  
  // const payablePrice = payload.price && payload.discountPrice ? payload.price - payload.discountPrice : undefined;
  // const monthlyPrice = payablePrice ? parseFloat((payablePrice / 12).toFixed(2)) : undefined;
  const payablePrice = updateData.price && updateData.discountPrice ? (updateData.price as number) - (updateData.discountPrice as number) : undefined;
  if (payablePrice !== undefined) updateData.payablePrice = payablePrice;

  const monthlyPrice = payablePrice ? parseFloat((payablePrice / 12).toFixed(2)) : undefined;
  if (monthlyPrice !== undefined) updateData.monthlyPrice = monthlyPrice;

  if (Array.isArray(payload.boilerFeatures)) {
    updateData.boilerFeatures = payload.boilerFeatures
      .filter((f) => f.title?.trim() && f.value?.trim())
      .map((f) => ({ title: f.title.trim(), value: f.value.trim() }));
  }

  if (payload.featureInformation !== undefined) {
    updateData.featureInformation = {
      featureTitle: payload.featureInformation?.featureTitle?.trim(),
      featureDescription: payload.featureInformation?.featureDescription?.trim(),
      featureLogo: featureLogo ?? product.featureInformation?.featureLogo ?? [],
    };
  } else if (featureLogo) {
    // New featureLogo files uploaded but no featureInformation payload — just update the logo
    updateData['featureInformation.featureLogo'] = featureLogo;
  }

  if (images) updateData.images = images;
  if (includedImages) updateData.includedImages = includedImages;
  if (boilerInstallationGuide) updateData.boilerInstallationGuide = boilerInstallationGuide;

  return this.productModel.findByIdAndUpdate(id, { $set: updateData }, { new: true });
}

  async deleteProductById(id: string) {
    const product = await this.productModel.findById(id);
    if (!product) throw new HttpException('Product not found', 404);
    return product.deleteOne();
  }
}
=======
import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../user/entities/user.entity';
import { fileUpload } from 'src/app/helpers/fileUploder';
import { IFilterParams } from 'src/app/helpers/pick';
import paginationHelper, { IOptions } from 'src/app/helpers/pagenation';
import buildWhereConditions from 'src/app/helpers/buildWhereConditions';
import { Product, ProductDocument } from './entitiy/product.entitiy';
import { CreateProductDto } from './dto/create.dto';
import { UpdateProductDto } from './dto/update.dto';
import { Quote, QuoteDocument } from '../quote/entities/quote.entity';
import { Booking, BookingDocument } from '../booking/entities/booking.entity';

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
    @InjectModel(Quote.name) private readonly quoteModel: Model<QuoteDocument>,
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
  ) {}

  private async getBookingCountMap(
    quoteField: 'productId' | 'controller' | 'extra',
  ): Promise<Map<string, number>> {
    const bookingCounts = await this.bookingModel.aggregate([
      {
        $lookup: {
          from: this.quoteModel.collection.name,
          localField: 'quote',
          foreignField: '_id',
          as: 'quoteData',
        },
      },
      { $unwind: '$quoteData' },
      {
        $match: {
          [`quoteData.${quoteField}`]: {
            $exists: true,
            $ne: null,
          },
        },
      },
      {
        $group: {
          _id: `$quoteData.${quoteField}`,
          bookingCount: { $sum: 1 },
        },
      },
    ]);

    return new Map(
      bookingCounts.map((item) => [String(item._id), Number(item.bookingCount)]),
    );
  }

  private compareValues(a: unknown, b: unknown, sortOrder: string) {
    const direction = sortOrder === 'asc' ? 1 : -1;

    if (a instanceof Date && b instanceof Date) {
      return (a.getTime() - b.getTime()) * direction;
    }

    if (typeof a === 'number' && typeof b === 'number') {
      return (a - b) * direction;
    }

    return String(a ?? '').localeCompare(String(b ?? '')) * direction;
  }

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

    const payablePrice = payload.price && payload.discountPrice ? payload.price - payload.discountPrice : undefined;
    const monthlyPrice = payablePrice ? parseFloat((payablePrice / 12).toFixed(2)) : undefined;

    return this.productModel.create({
      user: userId,
      title: payload.title?.trim(),
      description: payload.description?.trim(),
      shortDescription: payload.shortDescription?.trim(),
      images,
      badges: this.normalizeStringArray(payload.badges),
      price: this.normalizeNumber(payload.price),
      discountPrice: this.normalizeNumber(payload.discountPrice),
      payablePrice: payablePrice,
      monthlyPrice: monthlyPrice,
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
    const [total, products, bookingCountMap] = await Promise.all([
      this.productModel.countDocuments(whereConditions),
      this.productModel
        .find(whereConditions)
        .lean()
        .populate('user', 'fullName email'),
      this.getBookingCountMap('productId'),
    ]);

    const highestBookingCount = products.reduce((max, product) => {
      const bookingCount = bookingCountMap.get(String(product._id)) ?? 0;
      return Math.max(max, bookingCount);
    }, 0);

    const rankedProducts = products
      .map((product) => {
        const bookingCount = bookingCountMap.get(String(product._id)) ?? 0;
        return {
          ...product,
          bookingCount,
          isBestSeller:
            highestBookingCount > 0 && bookingCount === highestBookingCount,
        };
      })
      .sort((a, b) => {
        if (b.bookingCount !== a.bookingCount) {
          return b.bookingCount - a.bookingCount;
        }

        return this.compareValues(
          a[sortBy as keyof typeof a],
          b[sortBy as keyof typeof b],
          sortOrder,
        );
      });

    return {
      meta: { total, page, limit },
      data: rankedProducts.slice(skip, skip + limit),
    };
  }

  async getProductById(id: string) {
    const product = await this.productModel
      .findById(id)
      .populate('user', 'fullName email');
    if (!product) throw new HttpException('Product not found', 404);
    return product;
  }

  // async updateProductById(id: string, dto: UpdateProductDto) {
  //   const product = await this.productModel.findById(id);
  //   if (!product) throw new HttpException('Product not found', 404);
  //   return this.productModel.findByIdAndUpdate(id, dto, { new: true });
  // }
  async updateProductById(
  id: string,
  data: string,
  files: UploadedProductFiles,
) {
  const product = await this.productModel.findById(id);
  if (!product) throw new HttpException('Product not found', 404);

  const payload = this.parseJson<UpdateProductDto>(data, {} as UpdateProductDto);

  // Upload new images only if provided, otherwise keep existing
  const [images, includedImages, featureLogo] = await Promise.all([
    files.images?.length ? this.uploadMany(files.images) : Promise.resolve(undefined),
    files.includedImages?.length ? this.uploadMany(files.includedImages) : Promise.resolve(undefined),
    files.featureLogo?.length ? this.uploadMany(files.featureLogo) : Promise.resolve(undefined),
  ]);

  // Handle boilerInstallationGuide — upload new images if provided
  let boilerInstallationGuide: { title: string; image: string }[] | undefined;
  if (Array.isArray(payload.boilerInstallationGuide)) {
    const guideImageFiles = this.getValidFiles(files.installationGuideImages);
    const guideImageUrls = await this.uploadMany(guideImageFiles);
    boilerInstallationGuide = payload.boilerInstallationGuide.map((item, i) => ({
      title: item.title?.trim() ?? '',
      image: guideImageUrls[i] ?? item.image ?? '',
    }));
  }

  // Build update payload — only include fields that were actually sent
  const updateData: Record<string, unknown> = {};

  if (payload.title !== undefined) updateData.title = payload.title.trim();
  if (payload.description !== undefined) updateData.description = payload.description.trim();
  if (payload.shortDescription !== undefined) updateData.shortDescription = payload.shortDescription.trim();
  if (payload.boilerAbility !== undefined) updateData.boilerAbility = payload.boilerAbility.trim();
  if (payload.boilerIncludedData !== undefined) updateData.boilerIncludedData = payload.boilerIncludedData.trim();
  if (payload.badges !== undefined) updateData.badges = this.normalizeStringArray(payload.badges);
  if (payload.price !== undefined) updateData.price = this.normalizeNumber(payload.price);
  if (payload.discountPrice !== undefined) updateData.discountPrice = this.normalizeNumber(payload.discountPrice);
  if (payload.payablePrice !== undefined) updateData.payablePrice = this.normalizeNumber(payload.payablePrice);
  if (payload.monthlyPrice !== undefined) updateData.monthlyPrice = this.normalizeNumber(payload.monthlyPrice);

  if (Array.isArray(payload.boilerFeatures)) {
    updateData.boilerFeatures = payload.boilerFeatures
      .filter((f) => f.title?.trim() && f.value?.trim())
      .map((f) => ({ title: f.title.trim(), value: f.value.trim() }));
  }

  if (payload.featureInformation !== undefined) {
    updateData.featureInformation = {
      featureTitle: payload.featureInformation?.featureTitle?.trim(),
      featureDescription: payload.featureInformation?.featureDescription?.trim(),
      featureLogo: featureLogo ?? product.featureInformation?.featureLogo ?? [],
    };
  } else if (featureLogo) {
    // New featureLogo files uploaded but no featureInformation payload — just update the logo
    updateData['featureInformation.featureLogo'] = featureLogo;
  }

  if (images) updateData.images = images;
  if (includedImages) updateData.includedImages = includedImages;
  if (boilerInstallationGuide) updateData.boilerInstallationGuide = boilerInstallationGuide;

  return this.productModel.findByIdAndUpdate(id, { $set: updateData }, { new: true });
}

  async deleteProductById(id: string) {
    const product = await this.productModel.findById(id);
    if (!product) throw new HttpException('Product not found', 404);
    return product.deleteOne();
  }
}
>>>>>>> d32d61d304b3334a17c6f6c6638058314100f25d
