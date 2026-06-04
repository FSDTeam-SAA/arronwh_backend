import { HttpException, Injectable } from '@nestjs/common';
import { CreateReferDto } from './dto/create-refer.dto';
import { UpdateReferDto } from './dto/update-refer.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Refer, ReferDocument } from './entities/refer.entity';
import { IFilterParams } from 'src/app/helpers/pick';
import paginationHelper, { IOptions } from 'src/app/helpers/pagenation';
import buildWhereConditions from 'src/app/helpers/buildWhereConditions';
import sendMailer from 'src/app/helpers/sendMailer';
import { buildReferEmail } from 'src/app/helpers/template';
import { createReferContext } from '../email-template/email-template.context';
import { EmailTemplateService } from '../email-template/email-template.service';

@Injectable()
export class ReferService {
  constructor(
    @InjectModel(Refer.name)
    private readonly referModel: Model<ReferDocument>,
    private readonly emailTemplateService: EmailTemplateService,
  ) {}

  async createRefer(createReferDto: CreateReferDto) {
    const result = await this.referModel.create(createReferDto);
    const fallbackHtml = buildReferEmail(
      createReferDto.name,
      createReferDto.referred_by,
    );
    const email = await this.emailTemplateService.render({
      key: 'refer-friend',
      fallbackSubject: 'You have been referred to YOLO HEAT',
      fallbackHtml,
      context: createReferContext(
        createReferDto.name,
        createReferDto.referred_by,
      ),
    });

    await sendMailer(
      createReferDto.email,
      email.subject,
      email.html,
    );

    return result;
  }

  async getAllRefers(params: IFilterParams, options: IOptions) {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper(options);
    const searchAbleFields = [
      'referred_by',
      'name',
      'email',
      'phone',
      'postcode',
      'address',
      'message',
    ];

    const whenConditation = buildWhereConditions(params, searchAbleFields);

    const result = await this.referModel
      .find(whenConditation)
      .sort({ [sortBy]: sortOrder } as any)
      .skip(skip)
      .limit(limit);

    const total = await this.referModel.countDocuments(whenConditation);

    return {
      meta: {
        page,
        limit,
        total,
      },
      data: result,
    };
  }

  async getSingleRefer(id: string) {
    const result = await this.referModel.findById(id);
    if (!result) throw new HttpException('Refer is not found', 404);
    return result;
  }

  async updateRefer(id: string, updateReferDto: UpdateReferDto) {
    const result = await this.referModel.findByIdAndUpdate(id, updateReferDto, {
      new: true,
    });
    return result;
  }

  async deleteRefer(id: string) {
    const result = await this.referModel.findByIdAndDelete(id);
    return result;
  }
}
