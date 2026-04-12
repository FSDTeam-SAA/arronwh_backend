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
import pick from 'src/app/helpers/pick';

export type UploadedServiceFiles = {
  heroGallery?: Express.Multer.File[];
  brandLogo?: Express.Multer.File[];
  partnerLogo?: Express.Multer.File[];
  featureImage?: Express.Multer.File[];
  includedSectionImages?: Express.Multer.File[];
  installationStepImages?: Express.Multer.File[];
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
          type: 'object',
          example: {
            name: 'Worcester Bosch Greenstar 4000 25kw',
            brand: 'Worcester Bosch',
            category: 'boiler',
            serviceType: 'combi boiler installation',
            isActive: true,
            isFeatured: false,
            status: 'published',
            heroSection: {
              eyebrow: 'Your boiler',
              title: 'Worcester Bosch Greenstar 4000 25kw',
              subtitle: 'Combi Gas Boiler',
              gallery: [
                { alt: 'Front view', isPrimary: true, sortOrder: 0 },
                { alt: 'Side view', isPrimary: false, sortOrder: 1 },
              ],
              badges: [{ label: 'Save £270', type: 'sale', color: 'green' }],
              priceSummary: {
                fullPrice: 3369,
                discountedPrice: 3099,
                discountAmount: 270,
                discountPercentage: 8,
                currency: 'GBP',
                vatLabel: 'Inc VAT',
                note: 'Fixed price including installation',
              },
              financePlan: {
                enabled: true,
                monthlyPrice: 40.07,
                durationMonths: 120,
                apr: 9.9,
                deposit: 0,
                representativeExample:
                  '£40.07/month over 120 months at 9.9% APR',
              },
              cta: {
                primaryText: 'Choose',
                primaryAction: 'choose_service',
                secondaryText: 'Save quote',
                secondaryAction: 'save_quote',
              },
              paymentMethodIcons: ['visa', 'mastercard', 'amex'],
            },
            featureHighlightSection: {
              title: 'Purpose built for small-medium sized homes',
              description: 'Modern design and high efficiency.',
              specifications: [
                {
                  label: 'Warranty',
                  value: '10 years',
                  icon: 'shield',
                  sortOrder: 1,
                },
                {
                  label: 'Efficiency',
                  value: '94%',
                  icon: 'star',
                  sortOrder: 2,
                },
                { label: 'Output', value: '25kW', icon: 'bolt', sortOrder: 3 },
              ],
            },
            includedSection: {
              title: "What's included",
              description: 'Everything needed to get your system running.',
              items: [
                {
                  title: 'Carbon Monoxide Alarm',
                  shortDescription: 'Included with installation',
                  fullDescription:
                    'A carbon monoxide alarm is fitted as part of every installation for your safety.',
                  isExpandable: true,
                  isIncluded: true,
                  sortOrder: 1,
                },
                {
                  title: 'Flue Kit',
                  shortDescription: 'Standard horizontal flue',
                  fullDescription:
                    'Standard horizontal flue kit included, suitable for most properties.',
                  isExpandable: true,
                  isIncluded: true,
                  sortOrder: 2,
                },
              ],
            },
            installationGuideSection: {
              title: 'A step by step guide to your installation',
              description:
                'Our Gas Safe engineers will complete your installation on the agreed date.',
              steps: [
                {
                  stepNumber: 1,
                  title: 'Survey and preparation',
                  description:
                    'Initial setup and preparation of the installation area.',
                },
                {
                  stepNumber: 2,
                  title: 'Old boiler removal',
                  description: 'Safe removal and disposal of the old boiler.',
                },
                {
                  stepNumber: 3,
                  title: 'New boiler installation',
                  description:
                    'Installation and commissioning of the new boiler.',
                },
              ],
            },
            stickySummaryBar: {
              enabled: true,
              title: 'Worcester Bosch Greenstar 4000 25kw',
              discountedPrice: 3099,
              monthlyPrice: 40.07,
              saveQuoteText: 'Save quote',
              chooseText: 'Choose',
            },
            seo: {
              metaTitle:
                'Worcester Bosch Greenstar 4000 25kw | Boiler Installation',
              metaDescription:
                'Professional boiler installation package with 10-year warranty.',
              keywords: [
                'boiler',
                'installation',
                'worcester bosch',
                'combi boiler',
              ],
            },
          },
        },
        heroGallery: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
        brandLogo: { type: 'string', format: 'binary' },
        partnerLogo: { type: 'string', format: 'binary' },
        featureImage: { type: 'string', format: 'binary' },
        includedSectionImages: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
        installationStepImages: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @UseGuards(AuthGuard('admin'))
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'heroGallery', maxCount: 20 },
        { name: 'brandLogo', maxCount: 1 },
        { name: 'partnerLogo', maxCount: 1 },
        { name: 'featureImage', maxCount: 1 },
        { name: 'includedSectionImages', maxCount: 20 },
        { name: 'installationStepImages', maxCount: 50 },
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
  @ApiQuery({ name: 'name', required: false, type: String, example: '' })
  @ApiQuery({ name: 'brand', required: false, type: String, example: '' })
  @ApiQuery({ name: 'category', required: false, type: String, example: '' })
  @ApiQuery({ name: 'serviceType', required: false, type: String, example: '' })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    example: 'published',
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
      'name',
      'brand',
      'category',
      'serviceType',
      'status',
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
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update service by ID' })
  @ApiResponse({ status: 200, description: 'Service updated successfully' })
  @ApiParam({ name: 'id', type: String, example: '67f1234567890abcdef1234' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          example: {
            name: 'Updated Service Name',
            brand: 'Updated Brand',
            heroSection: {
              title: 'Updated hero title',
            },
          },
        },
        heroGallery: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
        brandLogo: { type: 'string', format: 'binary' },
        partnerLogo: { type: 'string', format: 'binary' },
        featureImage: { type: 'string', format: 'binary' },
        includedSectionImages: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
        installationStepImages: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'heroGallery', maxCount: 20 },
        { name: 'brandLogo', maxCount: 1 },
        { name: 'partnerLogo', maxCount: 1 },
        { name: 'featureImage', maxCount: 1 },
        { name: 'includedSectionImages', maxCount: 20 },
        { name: 'installationStepImages', maxCount: 50 },
      ],
      fileUpload.uploadConfig,
    ),
  )
  async updateServiceById(
    @Param('id') id: string,
    @Body('data') data: string,
    @UploadedFiles() files: UploadedServiceFiles,
  ) {
    const result = await this.serviceService.updateServiceById(id, data, files);

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
