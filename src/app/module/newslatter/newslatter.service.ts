import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateNewslatterDto } from './dto/create-newslatter.dto';
import { UpdateNewslatterDto } from './dto/update-newslatter.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Newslatter } from './entities/newslatter.entity';
import { Model } from 'mongoose';
import { IFilterParams } from 'src/app/helpers/pick';
import paginationHelper, { IOptions } from 'src/app/helpers/pagenation';
import buildWhereConditions from 'src/app/helpers/buildWhereConditions';
import sendMailer from 'src/app/helpers/sendMailer';

@Injectable()
export class NewslatterService {
  constructor(
    @InjectModel(Newslatter.name)
    private readonly newslatterModel: Model<Newslatter>,
  ) {}

  async createNewslatter(createNewslatterDto: CreateNewslatterDto) {
    const newslatter = await this.newslatterModel.findOne({
      email: createNewslatterDto.email,
    });
    if (!newslatter) {
      const createNewslatter =
        await this.newslatterModel.create(createNewslatterDto);

      return createNewslatter;
    } else {
      return newslatter;
    }
  }

  async findAllNewslatters(params: IFilterParams, options: IOptions) {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper(options);
    const whereConditions = buildWhereConditions(params, ['email']);
    const [result, total] = await Promise.all([
      this.newslatterModel
        .find(whereConditions)
        .sort({ [sortBy]: sortOrder } as any)
        .skip(skip)
        .limit(limit),
      this.newslatterModel.countDocuments(whereConditions),
    ]);

    return {
      data: result,
      meta: {
        total,
        page,
        limit,
      },
    };
  }

  async findOneNewslatter(id: string) {
    const result = await this.newslatterModel.findById(id);
    if (!result) {
      throw new NotFoundException(`Newslatter with id not found`);
    }
    return result;
  }

  async updateNewslatter(id: string, updateNewslatterDto: UpdateNewslatterDto) {
    const newslatter = await this.newslatterModel.findById(id);
    if (!newslatter) {
      throw new NotFoundException(`Newslatter with id not found`);
    }
    const result = await this.newslatterModel.findByIdAndUpdate(
      id,
      updateNewslatterDto,
      { new: true },
    );

    return result;
  }

  async removeNewslatter(id: string) {
    const result = await this.newslatterModel.findById(id);
    if (!result) {
      throw new NotFoundException(`Newslatter with id not found`);
    }
    return await this.newslatterModel.findByIdAndDelete(id);
  }

  async broadcastNewsletter(payload: { subject: string; html: string }) {
    const { subject, html } = payload;

    if (!subject?.trim() || !html?.trim()) {
      throw new NotFoundException('Subject and HTML content are required');
    }

    const subscribers = await this.newslatterModel.find();
    if (!subscribers.length) {
      throw new NotFoundException('No newsletter subscribers found');
    }

    await Promise.all(
      subscribers.map((sub) =>
        sendMailer(sub.email, subject, html).catch((err) =>
          console.error(`❌ Failed to send email to ${sub.email}:`, err),
        ),
      ),
    );

    return { sentCount: subscribers.length };
  }
}
