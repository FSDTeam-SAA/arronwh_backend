import { HttpException, Injectable } from '@nestjs/common';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Issue, IssueDocument } from './entities/issue.entity';
import { IFilterParams } from 'src/app/helpers/pick';
import paginationHelper, { IOptions } from 'src/app/helpers/pagenation';
import buildWhereConditions from 'src/app/helpers/buildWhereConditions';
import config from 'src/app/config';
import sendMailer from 'src/app/helpers/sendMailer';
import { issueEmailTemplate } from 'src/app/helpers/issueEmailTemplate';
import { createIssueContext } from '../email-template/email-template.context';
import { EmailTemplateService } from '../email-template/email-template.service';

@Injectable()
export class IssueService {
  constructor(
    @InjectModel(Issue.name)
    private readonly issueModel: Model<IssueDocument>,
    private readonly emailTemplateService: EmailTemplateService,
  ) {}

  async createIssue(createIssueDto: CreateIssueDto) {
    const result = await this.issueModel.create(createIssueDto);
    const adminEmail = config.email.admin;

    if (adminEmail) {
      const fallbackHtml = issueEmailTemplate(createIssueDto);
      const email = await this.emailTemplateService.render({
        key: 'issue-notification',
        fallbackSubject: 'New issue submitted - YOLO HEAT',
        fallbackHtml,
        context: createIssueContext(createIssueDto),
      });

      await sendMailer(adminEmail, email.subject, email.html);
    }

    return result;
  }

  async getAllIssues(params: IFilterParams, options: IOptions) {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper(options);
    const searchAbleFields = ['name', 'email', 'phone', 'message'];

    const whenConditation = buildWhereConditions(params, searchAbleFields);

    const result = await this.issueModel
      .find(whenConditation)
      .sort({ [sortBy]: sortOrder } as any)
      .skip(skip)
      .limit(limit);

    const total = await this.issueModel.countDocuments(whenConditation);

    return {
      meta: {
        page,
        limit,
        total,
      },
      data: result,
    };
  }

  async getSingleIssue(id: string) {
    const result = await this.issueModel.findById(id);
    if (!result) throw new HttpException('Issue is not found', 404);
    return result;
  }

  async updateIssue(id: string, updateIssueDto: UpdateIssueDto) {
    const result = await this.issueModel.findByIdAndUpdate(
      id,
      updateIssueDto,
      {
        new: true,
      },
    );
    return result;
  }

  async deleteIssue(id: string) {
    const result = await this.issueModel.findByIdAndDelete(id);
    return result;
  }
}
