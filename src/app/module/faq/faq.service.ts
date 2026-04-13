import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IFilterParams } from 'src/app/helpers/pick';
import paginationHelper, { IOptions } from 'src/app/helpers/pagenation';
import { Faq, FaqDocument } from './entities/faq.entities';

@Injectable()
export class FaqService {
  constructor(
    @InjectModel(Faq.name)
    private readonly faqModel: Model<FaqDocument>,
  ) {}

  async createFaq(payload: { question: string; answer: string }) {
    const faq = await this.faqModel.create(payload);
    return faq;
  }

  async getAllFaq(params: IFilterParams, options: IOptions) {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper(options);

    const searchableFields = ['question', 'answer'];
    const { searchTerm, ...filterData } = params;

    let whereConditions: any = {};

    if (searchTerm) {
      whereConditions.$or = searchableFields.map((field) => ({
        [field]: { $regex: searchTerm, $options: 'i' },
      }));
    }

    if (Object.keys(filterData).length) {
      whereConditions.$and = Object.entries(filterData).map(([key, value]) => ({
        [key]: value,
      }));
    }

    const total = await this.faqModel.countDocuments(whereConditions);

    const faqs = await this.faqModel
      .find(whereConditions)
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder } as any);

    return {
      meta: { page, limit, total },
      data: faqs,
    };
  }

  async getSingleFaq(id: string) {
    const faq = await this.faqModel.findById(id);
    if (!faq) throw new HttpException('Faq not found', 404);
    return faq;
  }

  async updateFaq(id: string, payload: { question?: string; answer?: string }) {
    const faq = await this.faqModel.findByIdAndUpdate(id, payload, {
      new: true,
    });
    if (!faq) throw new HttpException('Faq not found', 404);
    return faq;
  }

  async deleteFaq(id: string) {
    const faq = await this.faqModel.findByIdAndDelete(id);
    if (!faq) throw new HttpException('Faq not found', 404);
    return faq;
  }
}
