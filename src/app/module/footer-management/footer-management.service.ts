import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import buildWhereConditions from 'src/app/helpers/buildWhereConditions';
import paginationHelper, { IOptions } from 'src/app/helpers/pagenation';
import { IFilterParams } from 'src/app/helpers/pick';
import { CreateFooterManagementDto } from './dto/create-footer-management.dto';
import { UpdateFooterManagementDto } from './dto/update-footer-management.dto';
import {
  FooterManagement,
  FooterManagementDocument,
} from './entities/footer-management.entity';

@Injectable()
export class FooterManagementService {
  constructor(
    @InjectModel(FooterManagement.name)
    private readonly footerManagementModel: Model<FooterManagementDocument>,
  ) {}

  async createFooterManagement(
    createFooterManagementDto: CreateFooterManagementDto,
  ) {
    const result = await this.footerManagementModel.create(
      createFooterManagementDto,
    );
    if (!result) {
      throw new BadRequestException('Footer management is not created');
    }

    return result;
  }

  async findAllFooterManagement(params: IFilterParams, options: IOptions) {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper(options);
    const whereConditions = buildWhereConditions(params, [
      'location',
      'email',
      'phone',
      'reviewDescription',
    ]);

    const result = await this.footerManagementModel
      .find(whereConditions)
      .sort({ [sortBy]: sortOrder } as any)
      .skip(skip)
      .limit(limit);
    const total =
      await this.footerManagementModel.countDocuments(whereConditions);

    return { data: result, meta: { total, page, limit } };
  }

  async findOneFooterManagement(id: string) {
    const result = await this.footerManagementModel.findById(id);
    if (!result) {
      throw new BadRequestException('Footer management is not found');
    }

    return result;
  }

  async updateFooterManagement(
    id: string,
    updateFooterManagementDto: UpdateFooterManagementDto,
  ) {
    const result = await this.footerManagementModel.findByIdAndUpdate(
      id,
      updateFooterManagementDto,
      { new: true },
    );
    if (!result) {
      throw new BadRequestException('Footer management is not updated');
    }

    return result;
  }

  async deleteFooterManagement(id: string) {
    const result = await this.footerManagementModel.findByIdAndDelete(id);
    if (!result) {
      throw new BadRequestException('Footer management is not deleted');
    }

    return result;
  }
}
