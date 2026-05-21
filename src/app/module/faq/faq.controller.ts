import {
  Controller,
  Post,
  Param,
  Req,
  UseGuards,
  Get,
  Put,
  Delete,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FaqService } from './faq.service';
import type { Request } from 'express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import AuthGuard from 'src/app/middlewares/auth.guard';
import pick from 'src/app/helpers/pick';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';

@ApiTags('faq')
@Controller('faq')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new FAQ' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @ApiBody({
    schema: {
      properties: {
        question: { type: 'string', example: 'What is this service?' },
        answer: { type: 'string', example: 'This is a car checker service.' },
        category: { type: 'string', example: 'General' },
      },
    },
  })
  @HttpCode(HttpStatus.CREATED)
  async createFaq(@Body() body: CreateFaqDto) {
    const result = await this.faqService.createFaq(body);
    return {
      message: 'FAQ created successfully',
      data: result,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all FAQs' })
  @ApiQuery({ name: 'searchTerm', required: false, type: String, example: '' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    example: 'createdAt',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    example: 'desc',
  })
  @HttpCode(HttpStatus.OK)
  async getAllFaq(@Req() req: Request) {
    const filters = pick(req.query, ['searchTerm']);
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result = await this.faqService.getAllFaq(filters, options);
    return {
      message: 'FAQs retrieved successfully',
      meta: result.meta,
      data: result.data,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get FAQ by ID' })
  @HttpCode(HttpStatus.OK)
  async getSingleFaq(@Param('id') id: string) {
    const result = await this.faqService.getSingleFaq(id);
    return {
      message: 'FAQ retrieved successfully',
      data: result,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update FAQ by ID' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @ApiBody({
    schema: {
      properties: {
        question: { type: 'string' },
        answer: { type: 'string' },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async updateFaq(@Param('id') id: string, @Body() body: UpdateFaqDto) {
    const result = await this.faqService.updateFaq(id, body);
    return {
      message: 'FAQ updated successfully',
      data: result,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete FAQ by ID' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  async deleteFaq(@Param('id') id: string) {
    const result = await this.faqService.deleteFaq(id);
    return {
      message: 'FAQ deleted successfully',
      data: result,
    };
  }
}
