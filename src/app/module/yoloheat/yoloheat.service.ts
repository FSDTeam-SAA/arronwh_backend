import { HttpException, Injectable } from '@nestjs/common';
import { CreateYoloheatDto } from './dto/create-yoloheat.dto';
import { UpdateYoloheatDto } from './dto/update-yoloheat.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Yoloheat, YoloheatDocument } from './entities/yoloheat.entity';
import { Model } from 'mongoose';
import { fileUpload } from 'src/app/helpers/fileUploder';
import { IFilterParams } from 'src/app/helpers/pick';
import paginationHelper, { IOptions } from 'src/app/helpers/pagenation';
import buildWhereConditions from 'src/app/helpers/buildWhereConditions';

@Injectable()
export class YoloheatService {
  constructor(
    @InjectModel(Yoloheat.name)
    private readonly yoloheadModel: Model<YoloheatDocument>,
  ) {}

  async createYolohead(
    createYoloheatDto: CreateYoloheatDto,
    file?: Express.Multer.File,
  ) {
    if (file) {
      const { url } = await fileUpload.uploadToCloudinary(file);
      createYoloheatDto.image = url;
    }

    const result = await this.yoloheadModel.create(createYoloheatDto);
    return result;
  }

  async getAllYolohead(params: IFilterParams, options: IOptions) {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper(options);
    const whereConditions = buildWhereConditions(params, [
      'title',
      'discription',
    ]);

    const result = await this.yoloheadModel
      .find(whereConditions)
      .sort({ [sortBy]: sortOrder } as any)
      .skip(skip)
      .limit(limit);

    const total = await this.yoloheadModel.countDocuments();

    return {
      data: result,
      meta: {
        limit,
        page,
        total,
      },
    };
  }

  async getSingleYolohead(id: string) {
    const result = await this.yoloheadModel.findById(id);
    if (!result) throw new HttpException('Not Found', 404);
    return result;
  }

  async updateYolohead(
    id: string,
    updateYoloheatDto: UpdateYoloheatDto,
    file?: Express.Multer.File,
  ) {
    if (file) {
      const { url } = await fileUpload.uploadToCloudinary(file);
      updateYoloheatDto.image = url;
    }

    const updateData = Object.entries(updateYoloheatDto).reduce(
      (acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          acc[key] = value;
        }
        return acc;
      },
      {},
    );

    const result = await this.yoloheadModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!result) throw new HttpException('Not Found', 404);

    return result;
  }

  async deleteYoloheat(id: string) {
    const result = await this.yoloheadModel.findByIdAndDelete(id);
    if (!result) throw new HttpException('Not Found', 404);
    return result;
  }
}
