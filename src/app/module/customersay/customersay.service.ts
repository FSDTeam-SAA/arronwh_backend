import { HttpException, Injectable } from '@nestjs/common';
import { CreateCustomersayDto } from './dto/create-customersay.dto';
import { UpdateCustomersayDto } from './dto/update-customersay.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  Customersay,
  CustomersayDocument,
} from './entities/customersay.entity';
import { Model } from 'mongoose';
import { IFilterParams } from 'src/app/helpers/pick';
import paginationHelper, { IOptions } from 'src/app/helpers/pagenation';
import buildWhereConditions from 'src/app/helpers/buildWhereConditions';

@Injectable()
export class CustomersayService {
  constructor(
    @InjectModel(Customersay.name)
    private readonly customersayModel: Model<CustomersayDocument>,
  ) {}

  async createCustomersay(createCustomersayDto: CreateCustomersayDto) {
    const result = await this.customersayModel.create(createCustomersayDto);

    return result;
  }

  async getAllCustomersay(params: IFilterParams, options: IOptions) {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper(options);

    const whereConditions = buildWhereConditions(params, [
      'title',
      'description',
      'review',
      'name',
      'location',
    ]);

    const result = await this.customersayModel
      .find(whereConditions)
      .sort({ [sortBy]: sortOrder } as any)
      .skip(skip)
      .limit(limit);

    const total = await this.customersayModel.countDocuments(whereConditions);

    return {
      data: result,
      meta: {
        page,
        limit,
        total,
      },
    };
  }

  async getsingleCustomersay(id: string) {
    const result = await this.customersayModel.findById(id);
    if (!result) throw new HttpException('Not found', 404);
    return result;
  }

  async updateCustomersay(
    id: string,
    updateCustomersayDto: UpdateCustomersayDto,
  ) {
    const updateData = Object.entries(updateCustomersayDto).reduce(
      (acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          acc[key] = value;
        }
        return acc;
      },
      {},
    );
    const result = await this.customersayModel.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
      },
    );
    if (!result) throw new HttpException('Not found', 404);
    return result;
  }

  async deleteCustomersay(id: string) {
    const result = await this.customersayModel.findByIdAndDelete(id);
    if (!result) throw new HttpException('Not found', 404);
    return result;
  }
}
