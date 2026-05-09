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
  UploadedFiles,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { AboutusService } from './aboutus.service';
import { CreateAboutusDto } from './dto/create-aboutus.dto';
import { UpdateAboutusDto } from './dto/update-aboutus.dto';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import AuthGuard from 'src/app/middlewares/auth.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { fileUpload } from 'src/app/helpers/fileUploder';
import pick from 'src/app/helpers/pick';
import type { Request } from 'express';

@ApiTags('aboutus')
@Controller('aboutus')
export class AboutusController {
  constructor(private readonly aboutusService: AboutusService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new about us' })
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @UseInterceptors(FilesInterceptor('images', 5, fileUpload.uploadConfig))
  @HttpCode(HttpStatus.CREATED)
  async createAboutUs(
    @Body() createBannerDto: CreateAboutusDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const result = await this.aboutusService.createAbout(
      createBannerDto,
      files,
    );

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
    name: 'headerTitle',
    required: false,
  })
  @ApiQuery({
    type: String,
    name: 'secondTitle',
    required: false,
    description: 'Filter banners by second title',
  })
  @ApiQuery({
    type: String,
    name: 'headerDescription',
    required: false,
  })
  @ApiQuery({
    type: String,
    name: 'title',
    required: false,
  })
  @ApiQuery({
    type: String,
    name: 'description',
    required: false,
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
  async findAll(@Req() req: Request) {
    const filters = pick(req.query, [
      'searchTerm',
      'headerTitle',
      'headerDescriptionn',
      'title',
      'description',
    ]);
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result = await this.aboutusService.findAll(filters, options);

    return {
      message: 'About us retrieved successfully',
      meta: result.meta,
      data: result.data,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.aboutusService.findOne(id);

    return {
      message: 'About s retrieved successfully',
      data: result,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a about us by ID' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @UseInterceptors(FilesInterceptor('images', 5, fileUpload.uploadConfig))
  @ApiConsumes('multipart/form-data')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateBannerDto: UpdateAboutusDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const result = await this.aboutusService.update(id, updateBannerDto, files);

    return {
      message: 'Banner About us successfully',
      data: result,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a about us by ID' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  async deleteBanner(@Param('id') id: string) {
    const result = await this.aboutusService.remove(id);

    return {
      message: 'About us deleted successfully',
      data: result,
    };
  }
}
