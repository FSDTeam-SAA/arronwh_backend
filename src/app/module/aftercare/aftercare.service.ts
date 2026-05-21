import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateAftercareDto } from './dto/create-aftercare.dto';
import { UpdateAftercareDto } from './dto/update-aftercare.dto';
import { Aftercare, AftercareDocument } from './entities/aftercare.entity';
import { IFilterParams } from 'src/app/helpers/pick';
import paginationHelper, { IOptions } from 'src/app/helpers/pagenation';
import buildWhereConditions from 'src/app/helpers/buildWhereConditions';

@Injectable()
export class AftercareService {
  constructor(
    @InjectModel(Aftercare.name)
    private readonly aftercareModel: Model<AftercareDocument>,
  ) {}

  async createAftercare(createAftercareDto: CreateAftercareDto) {
    const result = await this.aftercareModel.create(createAftercareDto);
    return result;
  }

  async findAllAftercares(param: IFilterParams, options: IOptions) {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper(options);

    const whereConditions = buildWhereConditions(param, ['title', 'subTitle']);

    const result = await this.aftercareModel
      .find(whereConditions)
      .sort({ [sortBy]: sortOrder } as any)
      .skip(skip)
      .limit(limit);

    const total = await this.aftercareModel.countDocuments();
    return { data: result, mata: { total, limit, page } };
  }

  async findOneAftercare(id: string) {
    const result = await this.aftercareModel.findById(id);
    if (!result) throw new HttpException('Aftercare not found', 404);
    return result;
  }

  async updateAftercare(id: string, updateAftercareDto: UpdateAftercareDto) {
    const result = await this.aftercareModel.findByIdAndUpdate(
      id,
      updateAftercareDto,
      { new: true },
    );
    if (!result) throw new HttpException('Aftercare not found', 404);
    return result;
  }

  async deleteAftercare(id: string) {
    const result = await this.aftercareModel.findByIdAndDelete(id);
    if (!result) throw new HttpException('Aftercare not found', 404);
    return result;
  }
}
