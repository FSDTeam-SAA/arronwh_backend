import { HttpException, Injectable } from '@nestjs/common';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { fileUpload } from 'src/app/helpers/fileUploder';
import { InjectModel } from '@nestjs/mongoose';
import { Banner, BannerDocument } from './entities/banner.entity';
import { Model } from 'mongoose';
import { IFilterParams } from 'src/app/helpers/pick';
import paginationHelper, { IOptions } from 'src/app/helpers/pagenation';
import buildWhereConditions from 'src/app/helpers/buildWhereConditions';

@Injectable()
export class BannerService {
  constructor(
    @InjectModel(Banner.name)
    private readonly bannerModel: Model<BannerDocument>,
  ) {}

  async createBanner(
    createBannerDto: CreateBannerDto,
    file?: Express.Multer.File,
  ) {
    if (file) {
      const { url } = await fileUpload.uploadToCloudinary(file);
      createBannerDto.image = url;
    }

    const result = await this.bannerModel.create(createBannerDto);
    return result;
  }

  async getAllBanner(params: IFilterParams, options: IOptions) {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper(options);

    const whereConditions = buildWhereConditions(params, [
      'firstTitle',
      'secondTitle',
      'subTitle',
      'feature',
      'imageText',
      'backgroundColor',
      'textColor',
    ]);

    const result = await this.bannerModel
      .find(whereConditions)
      .limit(limit)
      .skip(skip)
      .sort({ [sortBy]: sortOrder } as any);

    const total = await this.bannerModel.countDocuments(whereConditions);
    return {
      data: result,
      meta: {
        limit,
        page,
        total,
      },
    };
  }

  async getSingleBanner(id: string) {
    const result = await this.bannerModel.findById(id);
    if (!result) throw new HttpException('Banner is not found', 404);
    return result;
  }

  async updateBanner(
    id: string,
    updateBannerDto: UpdateBannerDto,
    file?: Express.Multer.File,
  ) {
    const isExist = await this.bannerModel.findById(id);
    if (!isExist) throw new HttpException('Banner is not found', 404);
    if (file) {
      const { url } = await fileUpload.uploadToCloudinary(file);
      updateBannerDto.image = url;
    }
    const updateData = Object.entries(updateBannerDto).reduce(
      (acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          acc[key] = value;
        }
        return acc;
      },
      {},
    );

    const result = await this.bannerModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    return result;
  }

  async deleteBanner(id: string) {
    const result = await this.bannerModel.findByIdAndDelete(id);
    if (!result) throw new HttpException('Banner is not found', 404);
    const publicId = result.image?.split('/').pop();
    if (publicId) {
      await fileUpload.deleteFromCloudinary(publicId);
    }
    return result;
  }
}
