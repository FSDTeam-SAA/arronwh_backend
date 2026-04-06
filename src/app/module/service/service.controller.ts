import { ServiceService } from './service.service';
import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFiles,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiConsumes,
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { fileUpload } from 'src/app/helpers/fileUploder';
import AuthGuard from 'src/app/middlewares/auth.guard';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import pick from 'src/app/helpers/pick';

export type UploadedServiceFiles = {
  images?: Express.Multer.File[];
  productLogo?: Express.Multer.File[];
  authorLogo?: Express.Multer.File[];
  featureImage?: Express.Multer.File[];
  includeImages?: Express.Multer.File[];
  installationGuideImage?: Express.Multer.File[];
};

@ApiTags('Service')
@Controller('service')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a new service' })
  @ApiResponse({ status: 201, description: 'Service created successfully' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['data'],
      properties: {
        data: {
          type: 'string',
          example: JSON.stringify(
            {
              title: 'Premium Web Development Service',
              description:
                'We provide high-quality full-stack web development solutions.',
              badges: ['Popular', 'Best Seller'],
              price: 300,
              discount: 30,
              features: [
                {
                  title: 'Fast Performance',
                  details: 'Optimized for speed and efficiency',
                },
              ],
              featureSectionInformation: {
                title: 'Why Choose Our Service',
                description: 'We build modern and scalable solutions.',
              },
              includes: ['Source Code', 'Documentation', '1 Month Support'],
              installationGuide:
                'Step 1: Install dependencies. Step 2: Run the project.',
            },
            null,
            2,
          ),
        },
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
        productLogo: { type: 'string', format: 'binary' },
        authorLogo: { type: 'string', format: 'binary' },
        featureImage: { type: 'string', format: 'binary' },
        includeImages: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
        installationGuideImage: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseGuards(AuthGuard('admin'))
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'images', maxCount: 10 },
        { name: 'productLogo', maxCount: 1 },
        { name: 'authorLogo', maxCount: 1 },
        { name: 'featureImage', maxCount: 1 },
        { name: 'includeImages', maxCount: 10 },
        { name: 'installationGuideImage', maxCount: 1 },
      ],
      fileUpload.uploadConfig,
    ),
  )
  async createService(
    @Req() req: Request,
    @Body('data') data: string,
    @UploadedFiles() files: UploadedServiceFiles,
  ) {
    const result = await this.serviceService.createService(
      req.user!.id,
      data,
      files,
    );

    return {
      message: 'Service created successfully',
      service: result,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all services' })
  @ApiResponse({ status: 200, description: 'Services retrieved successfully' })
  @ApiQuery({ name: 'searchTerm', required: false, type: String, example: '' })
  @ApiQuery({ name: 'title', required: false, type: String, example: '' })
  @ApiQuery({ name: 'description', required: false, type: String, example: '' })
  @ApiQuery({ name: 'features', required: false, type: String, example: '' })
  @ApiQuery({ name: 'includes', required: false, type: String, example: '' })
  @ApiQuery({
    name: 'installationGuide',
    required: false,
    type: String,
    example: '',
  })
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
  async getAllServices(@Req() req: Request) {
    const filters = pick(req.query, [
      'searchTerm',
      'title',
      'description',
      'features',
      'includes',
      'installationGuide',
    ]);
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result = await this.serviceService.getAllServices(filters, options);

    return {
      message: 'Services retrieved successfully',
      meta: result.meta,
      data: result.data,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get service by ID' })
  @ApiResponse({ status: 200, description: 'Service retrieved successfully' })
  @ApiParam({ name: 'id', type: String, example: '67f1234567890abcdef1234' })
  async getServiceById(@Param('id') id: string) {
    const result = await this.serviceService.getServiceById(id);

    return {
      message: 'Service retrieved successfully',
      data: result,
    };
  }

  @Put(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update service by ID' })
  @ApiResponse({ status: 200, description: 'Service updated successfully' })
  @ApiParam({ name: 'id', type: String, example: '67f1234567890abcdef1234' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        badges: { type: 'array', items: { type: 'string' } },
        price: { type: 'number' },
        discount: { type: 'number' },
        features: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              details: { type: 'string' },
            },
          },
        },
        featureSectionInformation: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            productLogo: { type: 'string' },
            authorLogo: { type: 'string' },
            featureImage: { type: 'string' },
          },
        },
        includes: { type: 'array', items: { type: 'string' } },
        includeImage: { type: 'array', items: { type: 'string' } },
        installationGuide: { type: 'string' },
        installationGuideImage: { type: 'string' },
      },
    },
  })
  async updateServiceById(
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
  ) {
    const result = await this.serviceService.updateServiceById(
      id,
      updateServiceDto,
      {},
    );

    return {
      message: 'Service updated successfully',
      data: result,
    };
  }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete service by ID' })
  @ApiResponse({ status: 200, description: 'Service deleted successfully' })
  @ApiParam({ name: 'id', type: String, example: '67f1234567890abcdef1234' })
  async deleteServiceById(@Param('id') id: string) {
    const result = await this.serviceService.deleteServiceById(id);

    return {
      message: 'Service deleted successfully',
      data: result,
    };
  }
}
