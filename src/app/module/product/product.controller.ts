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
import { ProductService } from './product.service';
import type { UploadedProductFiles } from './product.service';
import { fileUpload } from 'src/app/helpers/fileUploder';
import AuthGuard from 'src/app/middlewares/auth.guard';
import pick from 'src/app/helpers/pick';
import { UpdateProductDto } from './dto/update.dto';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['data'],
      properties: {
        data: {
          type: 'string',
          example: JSON.stringify(
            {
              title: 'Boiler Pro 25kw',
              description: 'High-efficiency boiler system.',
              shortDescription: 'Best boiler for homes.',
              badges: ['Popular'],
              price: 1200,
              discountPrice: 1000,
              payablePrice: 950,
              monthlyPrice: 80,
              boilerAbility: '40 to 25kw',
              boilerFeatures: [
                {
                  warranty: '5 years',
                  title: 'Energy Efficient',
                  details: 'A+ rated',
                },
              ],
              featureInformation: {
                featureTitle: 'Why Choose Us',
                featureDescription: 'Industry leading quality.',
              },
              boilerIncludedData: 'Includes all fittings and parts.',
              boilerInstallationGuide: [{ title: 'Step 1: Mount the unit' }],
            },
            null,
            2,
          ),
        },
        images: { type: 'array', items: { type: 'string', format: 'binary' } },
        includedImages: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
        featureLogo: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
        installationGuideImages: {
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
        { name: 'images', maxCount: 10 },
        { name: 'includedImages', maxCount: 10 },
        { name: 'featureLogo', maxCount: 10 },
        { name: 'installationGuideImages', maxCount: 20 },
      ],
      fileUpload.uploadConfig,
    ),
  )
  async createProduct(
    @Req() req: Request,
    @Body('data') data: string,
    @UploadedFiles() files: UploadedProductFiles,
  ) {
    const result = await this.productService.createProduct(
      req.user!.id,
      data,
      files,
    );
    return { message: 'Product created successfully', data: result };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  @ApiQuery({ name: 'searchTerm', required: false, type: String })
  @ApiQuery({ name: 'title', required: false, type: String })
  @ApiQuery({ name: 'description', required: false, type: String })
  @ApiQuery({ name: 'boilerAbility', required: false, type: String })
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
  async getAllProducts(@Req() req: Request) {
    const filters = pick(req.query, [
      'searchTerm',
      'title',
      'description',
      'shortDescription',
      'boilerAbility',
      'boilerIncludedData',
    ]);
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result = await this.productService.getAllProducts(filters, options);
    return {
      message: 'Products retrieved successfully',
      meta: result.meta,
      data: result.data,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'id', type: String })
  async getProductById(@Param('id') id: string) {
    const result = await this.productService.getProductById(id);
    return { message: 'Product retrieved successfully', data: result };
  }

  @Put(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update product by ID' })
  @ApiParam({ name: 'id', type: String })
  async updateProductById(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    const result = await this.productService.updateProductById(id, dto);
    return { message: 'Product updated successfully', data: result };
  }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete product by ID' })
  @ApiParam({ name: 'id', type: String })
  async deleteProductById(@Param('id') id: string) {
    const result = await this.productService.deleteProductById(id);
    return { message: 'Product deleted successfully', data: result };
  }
}
