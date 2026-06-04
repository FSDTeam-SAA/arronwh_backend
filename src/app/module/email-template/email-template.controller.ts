import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import AuthGuard from 'src/app/middlewares/auth.guard';
import { UpdateEmailTemplateDto } from './dto/update-email-template.dto';
import { EmailTemplateService } from './email-template.service';

@ApiTags('email-templates')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('admin'))
@Controller('email-templates')
export class EmailTemplateController {
  constructor(private readonly emailTemplateService: EmailTemplateService) {}

  @Get()
  @ApiOperation({ summary: 'List editable email templates' })
  @HttpCode(HttpStatus.OK)
  async findAll() {
    const result = await this.emailTemplateService.findAll();

    return {
      message: 'Email templates retrieved successfully',
      data: result,
    };
  }

  @Get(':key')
  @ApiOperation({ summary: 'Get one editable email template' })
  @ApiParam({ name: 'key', type: String })
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('key') key: string) {
    const result = await this.emailTemplateService.findOne(key);

    return {
      message: 'Email template retrieved successfully',
      data: result,
    };
  }

  @Patch(':key')
  @ApiOperation({ summary: 'Update editable email template HTML or subject' })
  @ApiParam({ name: 'key', type: String })
  @ApiBody({ type: UpdateEmailTemplateDto })
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('key') key: string,
    @Body() payload: UpdateEmailTemplateDto,
  ) {
    const result = await this.emailTemplateService.update(key, payload);

    return {
      message: 'Email template updated successfully',
      data: result,
    };
  }

  @Post(':key/reset')
  @ApiOperation({ summary: 'Reset an email template to code default' })
  @ApiParam({ name: 'key', type: String })
  @HttpCode(HttpStatus.OK)
  async reset(@Param('key') key: string) {
    const result = await this.emailTemplateService.reset(key);

    return {
      message: 'Email template reset successfully',
      data: result,
    };
  }
}
