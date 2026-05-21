import { HttpException, Injectable } from '@nestjs/common';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Sale, SaleDocument } from './entities/sale.entity';
import { Model } from 'mongoose';
import { IFilterParams } from 'src/app/helpers/pick';
import paginationHelper, { IOptions } from 'src/app/helpers/pagenation';
import buildWhereConditions from 'src/app/helpers/buildWhereConditions';

@Injectable()
export class SalesService {
  constructor(
    @InjectModel(Sale.name) private readonly saleSchema: Model<SaleDocument>,
  ) {}

  async createSale(createSaleDto: CreateSaleDto) {
    const result = await this.saleSchema.create(createSaleDto);
    return result;
  }

  async findAllSales(param: IFilterParams, options: IOptions) {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper(options);

    const whereConditions = buildWhereConditions(param, [
      'title',
      'subTitle',
      'dateTime',
      'phonenumber',
      'description',
    ]);
    const result = await this.saleSchema
      .find(whereConditions)
      .sort({ [sortBy]: sortOrder } as any)
      .skip(skip)
      .limit(limit);
    const total = await this.saleSchema.countDocuments();
    return { data: result, mata: { total, limit, page } };
  }

  async findOneSale(id: string) {
    const result = await this.saleSchema.findById(id);
    if (!result) throw new HttpException('Sale not found', 404);
    return result;
  }

  async updateSale(id: string, updateSaleDto: UpdateSaleDto) {
    const result = await this.saleSchema.findByIdAndUpdate(id, updateSaleDto, {
      new: true,
    });
    if (!result) throw new HttpException('Sale not found', 404);
    return result;
  }

  async deleteSale(id: string) {
    const result = await this.saleSchema.findByIdAndDelete(id);
    if (!result) throw new HttpException('Sale not found', 404);

    return result;
  }
}
