import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTermsconditionDto } from './dto/create-termscondition.dto';
import { UpdateTermsconditionDto } from './dto/update-termscondition.dto';
import { Termscondition } from './entities/termscondition.entity';
import { IFilterParams } from 'src/app/helpers/pick';
import paginationHelper, { IOptions } from 'src/app/helpers/pagenation';
import buildWhereConditions from 'src/app/helpers/buildWhereConditions';

@Injectable()
export class TermsconditionsService {
  constructor(
    @InjectModel(Termscondition.name)
    private termsconditionModel: Model<Termscondition>,
  ) {}

  async createTerms(createTermsconditionDto: CreateTermsconditionDto) {
    const terms = await this.termsconditionModel.create(
      createTermsconditionDto,
    );
    return terms;
  }

  async getAllTerms(params: IFilterParams, options: IOptions) {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper(options);

    const whenereCondition = buildWhereConditions(params, [
      'title',
      'subtitle',
      'description',
    ]);

    const result = await this.termsconditionModel
      .find(whenereCondition)
      .sort({ [sortBy]: sortOrder } as any)
      .skip(skip)
      .limit(limit);

    const total =
      await this.termsconditionModel.countDocuments(whenereCondition);

    return { data: result, meta: { total, page, limit } };
  }

  async getSingleTerms(id: string) {
    const terms = await this.termsconditionModel.findById(id);
    if (!terms) {
      throw new NotFoundException('Terms and conditions not found');
    }
    return terms;
  }

  async updateTerms(
    id: string,
    updateTermsconditionDto: UpdateTermsconditionDto,
  ) {
    const terms = await this.termsconditionModel.findByIdAndUpdate(
      id,
      updateTermsconditionDto,
    );
    if (!terms) {
      throw new NotFoundException('Terms and conditions not found');
    }
    return terms;
  }

  async removeTerms(id: string) {
    const terms = await this.termsconditionModel.findById(id);
    if (!terms) {
      throw new NotFoundException('Terms and conditions not found');
    }
    await terms.deleteOne();
    return 'Terms and conditions deleted successfully';
  }
}
