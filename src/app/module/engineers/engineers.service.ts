import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateEngineerDto } from './dto/create-engineer.dto';
import { UpdateEngineerDto } from './dto/update-engineer.dto';
import { Engineer, EngineerDocument } from './entities/engineer.entity';
import { IFilterParams } from 'src/app/helpers/pick';
import paginationHelper, { IOptions } from 'src/app/helpers/pagenation';
import buildWhereConditions from 'src/app/helpers/buildWhereConditions';

@Injectable()
export class EngineerService {
  constructor(
    @InjectModel(Engineer.name)
    private readonly engineerModel: Model<EngineerDocument>,
  ) {}

  async createEngineer(createEngineerDto: CreateEngineerDto) {
    const result = await this.engineerModel.create(createEngineerDto);
    return result;
  }

  async findAllEngineers(param: IFilterParams, options: IOptions) {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper(options);

    const whereConditions = buildWhereConditions(param, [
      'title',
      'subTitle',
      'dateTime',
      'phonenumber',
      'description',
    ]);

    const result = await this.engineerModel
      .find(whereConditions)
      .sort({ [sortBy]: sortOrder } as any)
      .skip(skip)
      .limit(limit);

    const total = await this.engineerModel.countDocuments();
    return { data: result, mata: { total, limit, page } };
  }

  async findOneEngineer(id: string) {
    const result = await this.engineerModel.findById(id);
    if (!result) throw new HttpException('Engineer not found', 404);
    return result;
  }

  async updateEngineer(id: string, updateEngineerDto: UpdateEngineerDto) {
    const result = await this.engineerModel.findByIdAndUpdate(
      id,
      updateEngineerDto,
      { new: true },
    );
    if (!result) throw new HttpException('Engineer not found', 404);
    return result;
  }

  async deleteEngineer(id: string) {
    const result = await this.engineerModel.findByIdAndDelete(id);
    if (!result) throw new HttpException('Engineer not found', 404);
    return result;
  }
}
