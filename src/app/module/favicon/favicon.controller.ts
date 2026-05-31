import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FaviconService } from './favicon.service';
import { CreateFaviconDto } from './dto/create-favicon.dto';
import { UpdateFaviconDto } from './dto/update-favicon.dto';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileUpload } from 'src/app/helpers/fileUploder';
import AuthGuard from 'src/app/middlewares/auth.guard';
import type { Request } from 'express';
import pick from 'src/app/helpers/pick';

@ApiTags('favicon')
@Controller('favicon')
export class FaviconController {
  constructor(private readonly faviconService: FaviconService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new favicon' })
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @UseInterceptors(FileInterceptor('image', fileUpload.uploadConfig))
  @HttpCode(HttpStatus.CREATED)
  async createFavicon(
    @Body() createFaviconDto: CreateFaviconDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const result = await this.faviconService.createFavicon(
      createFaviconDto,
      file,
    );
    return {
      message: 'Favicon created successfully',
      data: result,
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Get the all favicon',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
  })
  @HttpCode(HttpStatus.OK)
  async findAllFavicon(@Req() req: Request) {
    const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);
    const result = await this.faviconService.findAllFavicon(options);
    return {
      message: 'Favicon fetched successfully',
      meta: result.meta,
      data: result.data,
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a favicon by ID',
  })
  @HttpCode(HttpStatus.OK)
  async findOneFavicon(@Param('id') id: string) {
    const result = await this.faviconService.findOneFavicon(id);
    console.log(result);

    return {
      message: 'Favicon fetched successfully',
      data: result,
    };
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a favicon by ID',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @UseInterceptors(FileInterceptor('image', fileUpload.uploadConfig))
  @HttpCode(HttpStatus.OK)
  async updateFavicon(
    @Param('id') id: string,
    @Body() updateFaviconDto: UpdateFaviconDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const result = await this.faviconService.updateFavicon(
      id,
      updateFaviconDto,
      file,
    );
    return {
      message: 'Favicon updated successfully',
      data: result,
    };
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a favicon by ID',
  })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  async removeFavicon(@Param('id') id: string) {
    const result = await this.faviconService.removeFavicon(id);
    return {
      message: 'Favicon deleted successfully',
      data: result,
    };
  }
}
