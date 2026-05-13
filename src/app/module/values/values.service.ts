import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateValueDto, ValueDataDto } from './dto/create-value.dto';
import { UpdateValueDataDto, UpdateValueDto } from './dto/update-value.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  Value,
  ValueData,
  ValueDataDocument,
  ValueDocument,
} from './entities/value.entity';
import { Model } from 'mongoose';
import { fileUpload } from 'src/app/helpers/fileUploder';
import { IFilterParams } from 'src/app/helpers/pick';
import paginationHelper, { IOptions } from 'src/app/helpers/pagenation';
import buildWhereConditions from 'src/app/helpers/buildWhereConditions';

@Injectable()
export class ValuesService {
  constructor(
    @InjectModel(Value.name) private readonly valueModel: Model<ValueDocument>,
    @InjectModel(ValueData.name)
    private readonly valueDataModel: Model<ValueDataDocument>,
  ) {}

  async createValue(createValueDto: CreateValueDto) {
    const result = await this.valueModel.create(createValueDto);
    if (!result) throw new BadRequestException('Value is not created');

    return result;
  }

  async createValueData(
    createValueDataDto: ValueDataDto,
    file?: Express.Multer.File,
  ) {
    if (file) {
      const { url } = await fileUpload.uploadToCloudinary(file);
      createValueDataDto.image = url;
    }
    const result = await this.valueDataModel.create(createValueDataDto);
    if (!result) throw new BadRequestException('Value Data is not created');

    return result;
  }

  async findAllValues(params: IFilterParams, options: IOptions) {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper(options);
    const whereConditions = buildWhereConditions(params, [
      'valueTitle',
      'valueDetail',
    ]);
    const result = await this.valueModel
      .find(whereConditions)
      .sort({ [sortBy]: sortOrder } as any)
      .skip(skip)
      .limit(limit);
    const total = await this.valueModel.countDocuments(whereConditions);

    return { data: result, meta: { total, page, limit } };
  }

  async findOneValue(id: string) {
    const result = await this.valueModel.findById(id);
    if (!result) throw new BadRequestException('Value Data is not found');

    return result;
  }

  async updateValue(id: string, updateValueDto: UpdateValueDto) {
    const result = await this.valueModel.findByIdAndUpdate(id, updateValueDto, {
      new: true,
    });
    if (!result) throw new BadRequestException('Value is not updated');

    return result;
  }

  async deleteValue(id: string) {
    const result = await this.valueModel.findByIdAndDelete(id);
    if (!result) throw new BadRequestException('Value is not deleted');

    return result;
  }

  async findAllValueData(params: IFilterParams, options: IOptions) {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper(options);
    const whereConditions = buildWhereConditions(params, [
      'title',
      'description',
    ]);
    const result = await this.valueDataModel
      .find(whereConditions)
      .sort({ [sortBy]: sortOrder } as any)
      .skip(skip)
      .limit(limit);
    const total = await this.valueDataModel.countDocuments(whereConditions);

    return { data: result, meta: { total, page, limit } };
  }

  async findOneValueData(id: string) {
    const result = await this.valueDataModel.findById(id);
    if (!result) throw new BadRequestException('Value Data is not found');

    return result;
  }

  async updateValueData(
    id: string,
    updateValueDataDto: UpdateValueDataDto,
    file?: Express.Multer.File,
  ) {
    if (file) {
      const { url } = await fileUpload.uploadToCloudinary(file);
      updateValueDataDto.image = url;
    }
    const result = await this.valueDataModel.findByIdAndUpdate(
      id,
      updateValueDataDto,
      {
        new: true,
      },
    );
    if (!result) throw new BadRequestException('Value Data is not updated');

    return result;
  }

  async deleteValueData(id: string) {
    const result = await this.valueDataModel.findByIdAndDelete(id);
    if (!result) throw new BadRequestException('Value Data is not deleted');

    return result;
  }
}
