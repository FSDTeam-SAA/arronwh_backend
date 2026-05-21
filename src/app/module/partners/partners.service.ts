import { HttpException, Injectable } from '@nestjs/common';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Partner, PartnerDocument } from './entities/partner.entity';
import { Model } from 'mongoose';
import { fileUpload } from 'src/app/helpers/fileUploder';
import { IFilterParams } from 'src/app/helpers/pick';
import paginationHelper, { IOptions } from 'src/app/helpers/pagenation';
import buildWhereConditions from 'src/app/helpers/buildWhereConditions';

@Injectable()
export class PartnersService {
  constructor(
    @InjectModel(Partner.name)
    private readonly partnerModel: Model<PartnerDocument>,
  ) {}

  async createPatner(
    createPartnerDto: CreatePartnerDto,
    files?: Express.Multer.File[],
  ) {
    if (files && files.length > 0) {
      const fileDatas = await Promise.all(
        files.map((file) => fileUpload.uploadToCloudinary(file)),
      );
      createPartnerDto.images = fileDatas.map((data) => data.url);
    }
    const result = await this.partnerModel.create(createPartnerDto);
    return result;
  }

  async getAllPatner(params: IFilterParams, options: IOptions) {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper(options);

    const whereConditions = buildWhereConditions(params, [
      'excellent',
      'title',
    ]);

    const result = await this.partnerModel
      .find(whereConditions)
      .limit(limit)
      .skip(skip)
      .sort({ [sortBy]: sortOrder } as any);

    const total = await this.partnerModel.countDocuments();

    return {
      data: result,
      meta: {
        limit,
        page,
        total,
      },
    };
  }

  async getSinglePartner(id: string) {
    const result = await this.partnerModel.findById(id);
    return result;
  }

  async updatePartner(
    id: string,
    updatePartnerDto: UpdatePartnerDto,
    files?: Express.Multer.File[],
  ) {
    if (files && files.length > 0) {
      const fileDatas = await Promise.all(
        files.map((file) => fileUpload.uploadToCloudinary(file)),
      );
      updatePartnerDto.images = fileDatas.map((data) => data.url);
    }
    const updateData = Object.entries(updatePartnerDto).reduce(
      (acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          acc[key] = value;
        }
        return acc;
      },
      {},
    );
    const result = await this.partnerModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    return result;
  }

  async addImage(id: string, files: Express.Multer.File[]) {
    const existPartner = await this.partnerModel.findById(id);
    if (!existPartner) {
      throw new HttpException('Partner not found', 404);
    }

    if (!files || files.length === 0) {
      throw new HttpException('No files uploaded', 400);
    }

    const fileDatas = await Promise.all(
      files.map((file) => fileUpload.uploadToCloudinary(file)),
    );

    const imageUrls = fileDatas.map((data) => data.url);

    const result = await this.partnerModel.findByIdAndUpdate(
      id,
      {
        $push: { images: { $each: imageUrls } },
      },
      { new: true },
    );

    return result;
  }

  async removeImage(id: string, imageUrl: string) {
    const partner = await this.partnerModel.findById(id);

    if (!partner) {
      throw new HttpException('Partner not found', 404);
    }

    if (!partner.images.includes(imageUrl)) {
      throw new HttpException('Image not found in partner', 404);
    }
    await fileUpload.deleteFromCloudinary(imageUrl);

    const updated = await this.partnerModel.findByIdAndUpdate(
      id,
      {
        $pull: { images: imageUrl },
      },
      { new: true },
    );

    return updated;
  }

  async deletePartner(id: string) {
    const result = await this.partnerModel.findByIdAndDelete(id);
    return result;
  }
}
