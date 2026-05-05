import { HttpException, Injectable } from '@nestjs/common';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { UpdatePolicyDto } from './dto/update-policy.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Policy, PolicyDocument } from './entities/policy.entity';
import { Model } from 'mongoose';
import { IFilterParams } from 'src/app/helpers/pick';
import paginationHelper, { IOptions } from 'src/app/helpers/pagenation';
import buildWhereConditions from 'src/app/helpers/buildWhereConditions';

@Injectable()
export class PolicyService {
  constructor(
    @InjectModel(Policy.name)
    private readonly policyModel: Model<PolicyDocument>,
  ) {}

  async createPrivet(createPolicyDto: CreatePolicyDto) {
    const result = await this.policyModel.create(createPolicyDto);
    return result;
  }

  async findAllprivates(params: IFilterParams, options: IOptions) {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper(options);
    const whereCondition = buildWhereConditions(params, [
      'title',
      'description',
    ]);
    const result = await this.policyModel
      .find(whereCondition)
      .sort({ [sortBy]: sortOrder } as any)
      .skip(skip)
      .limit(limit);
    const total = await this.policyModel.countDocuments(whereCondition);
    return {
      data: result,
      meta: {
        limit,
        page,
        total,
      },
    };
  }

  async getSinglePrivates(id: string) {
    const result = await this.policyModel.findById(id);
    if (!result) throw new HttpException('Not Found', 404);
    return result;
  }

  async updatePrivates(id: string, updatePolicyDto: UpdatePolicyDto) {
    const result = await this.policyModel.findByIdAndUpdate(
      id,
      updatePolicyDto,
      { new: true },
    );
    if (!result) throw new HttpException('Not Found', 404);
    return result;
  }

  async deletePrivates(id: string) {
    const result = await this.policyModel.findByIdAndDelete(id);
    if (!result) throw new HttpException('Not Found', 404);
    return result;
  }
}
