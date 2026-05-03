import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFiles,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { PartnersService } from './partners.service';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { fileUpload } from 'src/app/helpers/fileUploder';
import AuthGuard from 'src/app/middlewares/auth.guard';
import pick from 'src/app/helpers/pick';
import type { Request } from 'express';

@ApiTags('partners')
@Controller('partners')
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new partner' })
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @UseInterceptors(FilesInterceptor('images', 10, fileUpload.uploadConfig))
  @HttpCode(HttpStatus.CREATED)
  async createPartyner(
    @Body() createBannerDto: CreatePartnerDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const result = await this.partnersService.createPatner(
      createBannerDto,
      files,
    );

    return {
      message: 'Partner created successfully',
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
    name: 'excellent',
    required: false,
    description: 'Filter banners by first title',
  })
  @ApiQuery({
    type: String,
    name: 'title',
    required: false,
    description: 'Filter banners by second title',
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
  async getAllPatner(@Req() req: Request) {
    const filters = pick(req.query, ['searchTerm', 'excellent', 'title']);
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result = await this.partnersService.getAllPatner(filters, options);

    return {
      message: 'Partnpartner retrieved successfully',
      meta: result.meta,
      data: result.data,
    };
  }

  @Get(':id')
  async getSinglePartner(@Param('id') id: string) {
    const result = await this.partnersService.getSinglePartner(id);

    return {
      message: "'Partner retrieved successfully",
      data: result,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a partner by ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @UseInterceptors(FilesInterceptor('images', 10, fileUpload.uploadConfig))
  @HttpCode(HttpStatus.CREATED)
  async updatePartner(
    @Param('id') id: string,
    @Body() updatePartnerDto: UpdatePartnerDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const result = await this.partnersService.updatePartner(
      id,
      updatePartnerDto,
      files,
    );

    return {
      message: 'Partner update successfully',
      data: result,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a Partner by ID' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  async deletePartner(@Param('id') id: string) {
    const result = await this.partnersService.deletePartner(id);

    return {
      message: 'Partner deleted successfully',
      data: result,
    };
  }
}
