import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { ExtraService } from './extra.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import AuthGuard from 'src/app/middlewares/auth.guard';
import pick from 'src/app/helpers/pick';
import type { Request } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';
import { fileUpload } from 'src/app/helpers/fileUploder';

@ApiTags('extra')
@Controller('extra')
export class ExtraController {
  constructor(private readonly extraService: ExtraService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new extra' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('images', 10, fileUpload.uploadConfig))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: '' },
        description: { type: 'string', example: '' },
        badges: {
          type: 'array',
          items: { type: 'string' },
          example: ['OUR BEST SELLER', 'Latest Model'],
        },
        price: { type: 'number', example: 299.99 },
        discount: { type: 'number', example: 10 },
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Req() req: Request,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const result = await this.extraService.create(req.body, files);
    return {
      message: 'Extra created successfully',
      data: result,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all extras' })
  @ApiQuery({ name: 'searchTerm', required: false, type: String, example: '' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'sortBy', required: false, type: String, example: 'createdAt' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], example: 'desc' })
  @HttpCode(HttpStatus.OK)
  async getAll(@Req() req: Request) {
    const filters = pick(req.query, ['searchTerm']);
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result = await this.extraService.getAll(filters, options);
    return {
      message: 'Extras retrieved successfully',
      meta: result.meta,
      data: result.data,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single extra by ID' })
  @HttpCode(HttpStatus.OK)
  async getSingle(@Param('id') id: string) {
    const result = await this.extraService.getSingle(id);
    return {
      message: 'Extra retrieved successfully',
      data: result,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an extra' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('images', 10, fileUpload.uploadConfig))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: '' },
        description: { type: 'string', example: '' },
        badges: {
          type: 'array',
          items: { type: 'string' },
          example: ['OUR BEST SELLER'],
        },
        price: { type: 'number', example: 299.99 },
        discount: { type: 'number', example: 10 },
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Req() req: Request,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const result = await this.extraService.update(id, req.body, files);
    return {
      message: 'Extra updated successfully',
      data: result,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an extra' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string) {
    const result = await this.extraService.delete(id);
    return {
      message: 'Extra deleted successfully',
      data: result,
    };
  }
}