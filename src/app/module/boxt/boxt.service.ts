import { HttpException, Injectable } from '@nestjs/common';
import { CreateBoxtDto } from './dto/create-boxt.dto';
import { UpdateBoxtDto } from './dto/update-boxt.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Boxt, BoxtDocument } from './entities/boxt.entity';
import { Model } from 'mongoose';
import { fileUpload } from 'src/app/helpers/fileUploder';
import { IFilterParams } from 'src/app/helpers/pick';
import paginationHelper, { IOptions } from 'src/app/helpers/pagenation';
import buildWhereConditions from 'src/app/helpers/buildWhereConditions';

@Injectable()
export class BoxtService {
  constructor(
    @InjectModel(Boxt.name) private readonly boxtModel: Model<BoxtDocument>,
  ) {}

  async createBoxt(createBoxtDto: CreateBoxtDto, file?: Express.Multer.File) {
    if (file) {
      const {url} = await fileUpload.uploadToCloudinary(file);
      createBoxtDto.image = url;
    }
    const result = await this.boxtModel.create(createBoxtDto);
    return result;
  }

  async getAllBoxts(params: IFilterParams, options: IOptions) {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper(options);
    const whereCondition = buildWhereConditions(params, [
      'title',
      'description',
    ]);
    const result = await this.boxtModel
      .find(whereCondition)
      .sort({ [sortBy]: sortOrder } as any)
      .skip(skip)
      .limit(limit);
    const total = await this.boxtModel.countDocuments(whereCondition);
    return {
      data: result,
      meta: {
        limit,
        page,
        total,
      },
    };
  }

  async getBoxtById(id: string) {
    const result = await this.boxtModel.findById(id);
    if (!result) throw new HttpException('Boxt not found', 404);
    return result;
  }

  async updateBoxt(id: string, updateBoxtDto: UpdateBoxtDto, file?: Express.Multer.File) {
    if (file) {
      const {url} = await fileUpload.uploadToCloudinary(file);
      updateBoxtDto.image = url;
    }
    const result = await this.boxtModel.findByIdAndUpdate(id, updateBoxtDto, { new: true });
    if (!result) throw new HttpException('Boxt not found', 404);
    return result;
  }

  async deleteBoxt(id: string) {
    const result = await this.boxtModel.findByIdAndDelete(id);
    if (!result) throw new HttpException('Boxt not found', 404);
    return result;
  }
}
