import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import paginationHelper, { IOptions } from 'src/app/helpers/pagenation';
import { IFilterParams } from 'src/app/helpers/pick';
import buildWhereConditions from 'src/app/helpers/buildWhereConditions';
import { CreateQuizePriceManagementDto } from './dto/create-quize-price-management.dto';
import { UpdateQuizePriceManagementDto } from './dto/update-quize-price-management.dto';
import {
  QuizePriceManagement,
  QuizePriceManagementDocument,
} from './entities/quize-price-management.entity';

@Injectable()
export class QuizePriceManagementService {
  constructor(
    @InjectModel(QuizePriceManagement.name)
    private readonly quizePriceManagementModel: Model<QuizePriceManagementDocument>,
  ) {}

  async createQuizePriceManagement(
    createQuizePriceManagementDto: CreateQuizePriceManagementDto,
  ) {
    const result = await this.quizePriceManagementModel.create(
      createQuizePriceManagementDto,
    );
    if (!result) {
      throw new BadRequestException('Quize price management is not created');
    }

    return result;
  }

  async findAllQuizePriceManagement(
    params: IFilterParams,
    options: IOptions,
  ) {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper(options);
    const whereConditions = buildWhereConditions(params, ['name']);

    const result = await this.quizePriceManagementModel
      .find(whereConditions)
      .sort({ [sortBy]: sortOrder } as any)
      .skip(skip)
      .limit(limit);
    const total =
      await this.quizePriceManagementModel.countDocuments(whereConditions);

    return { data: result, meta: { total, page, limit } };
  }

  async findOneQuizePriceManagement(id: string) {
    const result = await this.quizePriceManagementModel.findById(id);
    if (!result) {
      throw new BadRequestException('Quize price management is not found');
    }

    return result;
  }

  async updateQuizePriceManagement(
    id: string,
    updateQuizePriceManagementDto: UpdateQuizePriceManagementDto,
  ) {
    const result = await this.quizePriceManagementModel.findByIdAndUpdate(
      id,
      updateQuizePriceManagementDto,
      { new: true },
    );
    if (!result) {
      throw new BadRequestException('Quize price management is not updated');
    }

    return result;
  }

  async deleteQuizePriceManagement(id: string) {
    const result = await this.quizePriceManagementModel.findByIdAndDelete(id);
    if (!result) {
      throw new BadRequestException('Quize price management is not deleted');
    }

    return result;
  }
}
