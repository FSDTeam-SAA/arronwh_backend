import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  HttpCode,
  HttpStatus,
  UploadedFile,
  Req,
} from '@nestjs/common';
import { BannerService } from './banner.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import AuthGuard from 'src/app/middlewares/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileUpload } from 'src/app/helpers/fileUploder';
import type { Request } from 'express';
import pick from 'src/app/helpers/pick';

@ApiTags('banner')
@Controller('banner')
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new banner' })
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @UseInterceptors(FileInterceptor('image', fileUpload.uploadConfig))
  @HttpCode(HttpStatus.CREATED)
  async createBanner(
    @Body() createBannerDto: CreateBannerDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const result = await this.bannerService.createBanner(createBannerDto, file);

    return {
      message: 'Banner created successfully',
      data: result,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all banners' })
  @ApiQuery({
    type: String,
    name: 'searchTerm',
    required: false,
    description: 'Search banners by title',
  })
  @ApiQuery({
    type: String,
    name: 'firstTitle',
    required: false,
    description: 'Filter banners by first title',
  })
  @ApiQuery({
    type: String,
    name: 'secondTitle',
    required: false,
    description: 'Filter banners by second title',
  })
  @ApiQuery({
    type: String,
    name: 'subTitle',
    required: false,
    description: 'Filter banners by sub title',
  })
  @ApiQuery({
    type: String,
    name: 'feature',
    required: false,
    description: 'Filter banners by feature',
  })
  @ApiQuery({
    type: String,
    name: 'imageText',
    required: false,
    description: 'Filter banners by image text',
  })
  @ApiQuery({
    type: String,
    name: 'backgroundColor',
    required: false,
    description: 'Filter banners by background color',
  })
  @ApiQuery({
    type: String,
    name: 'textColor',
    required: false,
    description: 'Filter banners by text color',
  })
  @ApiQuery({
    type: Number,
    name: 'limit',
    required: false,
    description: 'Number of banners to retrieve',
  })
  @ApiQuery({
    type: Number,
    name: 'page',
    required: false,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    type: String,
    name: 'sortBy',
    required: false,
    description: 'Sort banners by a field',
  })
  @ApiQuery({
    type: String,
    name: 'sortOrder',
    required: false,
    description: 'Sort order (asc or desc)',
  })
  @HttpCode(HttpStatus.OK)
  async getAllBanner(@Req() req: Request) {
    const filters = pick(req.query, [
      'searchTerm',
      'firstTitle',
      'secondTitle',
      'subTitle',
      'feature',
      'imageText',
      'backgroundColor',
      'textColor',
    ]);
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result = await this.bannerService.getAllBanner(filters, options);

    return {
      message: 'Banners retrieved successfully',
      meta: result.meta,
      data: result.data,
    };
  }

  @Get(':id')
  async getSingleBanner(@Param('id') id: string) {
    const result = await this.bannerService.getSingleBanner(id);

    return {
      message: "'Banners retrieved successfully",
      data: result,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a banner by ID' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @UseInterceptors(FileInterceptor('image', fileUpload.uploadConfig))
  @ApiConsumes('multipart/form-data')
  @HttpCode(HttpStatus.OK)
  async updateBanner(
    @Param('id') id: string,
    @Body() updateBannerDto: UpdateBannerDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const result = await this.bannerService.updateBanner(
      id,
      updateBannerDto,
      file,
    );

    return {
      message: 'Banner update successfully',
      data: result,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a banner by ID' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  async deleteBanner(@Param('id') id: string) {
    const result = await this.bannerService.deleteBanner(id);

    return {
      message: 'Banner deleted successfully',
      data: result,
    };
  }
}
