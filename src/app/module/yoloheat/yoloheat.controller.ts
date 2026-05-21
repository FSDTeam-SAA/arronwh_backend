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
import { YoloheatService } from './yoloheat.service';
import { CreateHeaderDataDto, CreateYoloheatDto } from './dto/create-yoloheat.dto';
import { UpdateHeaderDataDto, UpdateYoloheatDto } from './dto/update-yoloheat.dto';
import {
  ApiBearerAuth,
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

@ApiTags('yolohead')
@Controller('yoloheat')
export class YoloheatController {
  constructor(private readonly yoloheatService: YoloheatService) {}

  @Post('header')
  @ApiOperation({
    summary: 'create header data',
  })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.CREATED)
  async createHeaderData(
    @Body() createHeaderDataDto: CreateHeaderDataDto,
  ) {
    const result = await this.yoloheatService.createHeaderData(
      createHeaderDataDto,
    );

    return {
      message: 'header data created successfully',
      data: result,
    };
  }

  @Get('header')
  @ApiOperation({
    summary: 'find all header data',
  })
  @ApiQuery({
    type: 'string',
    name: 'searchTerm',
    required: false,
  })
  @ApiQuery({
    type: 'string',
    name: 'headerTitle',
    required: false,
  })
  @ApiQuery({
    type: 'string',
    name: 'headerDiscription',
    required: false,
  })
  @ApiQuery({
    type: 'string',
    name: 'page',
    required: false,
  })
  @ApiQuery({
    type: 'number',
    name: 'limit',
    required: false,
  })
  @ApiQuery({
    type: 'string',
    name: 'sortBy',
    required: false,
  })
  @ApiQuery({
    type: 'string',
    name: 'sortOrder',
    required: false,
  })
  @HttpCode(HttpStatus.OK)
  async getAllHeaderData(@Req() req: Request) {
    const filters = pick(req.query, [
      'searchTerm',
      'headerTitle',
      'headerDiscription',
    ]);
    const params = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result = await this.yoloheatService.getAllHeaderData(filters, params);

    return {
      message: 'header data retrieved successfully',
      meta: result.meta,
      data: result.data,
    };
  }

  @Get('header/:id')
  @ApiOperation({
    summary: 'find single header data',
  })
  @HttpCode(HttpStatus.OK)
  async getSingleHeaderData(@Param('id') id: string) {
    const result = await this.yoloheatService.getSingleHeaderData(id);

    return {
      message: 'header data retrieved successfully',
      data: result,
    };
  }

  @Patch('header/:id')
  @ApiOperation({
    summary: 'update header data',
  })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  async updateHeaderData(
    @Param('id') id: string,
    @Body() updateHeaderDataDto: UpdateHeaderDataDto,
  ) {
    const result = await this.yoloheatService.updateHeaderData(
      id,
      updateHeaderDataDto,
    );

    return {
      message: 'header data updated successfully',
      data: result,
    };
  }

  @Delete('header/:id')
  @ApiOperation({
    summary: 'delete header data',
  })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  async deleteHeaderData(@Param('id') id: string) {
    const result = await this.yoloheatService.deleteHeaderData(id);

    return {
      message: 'header data deleted successfully',
      data: result,
    };
  }

  @Post()
  @ApiOperation({
    summary: 'create yolohead',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @UseInterceptors(FileInterceptor('image', fileUpload.uploadConfig))
  @HttpCode(HttpStatus.CREATED)
  async createYolohead(
    @Body() createYoloheatDto: CreateYoloheatDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const result = await this.yoloheatService.createYolohead(
      createYoloheatDto,
      file,
    );

    return {
      message: 'yoloheat created successfully',
      data: result,
    };
  }

  @Get()
  @ApiOperation({
    summary: 'find all yolohead',
  })
  @ApiQuery({
    type: 'string',
    name: 'searchTerm',
    required: false,
  })
  @ApiQuery({
    type: 'string',
    name: 'heder',
    required: false,
  })
  @ApiQuery({
    type: 'string',
    name: 'hederDiscription',
    required: false,
  })
  @ApiQuery({
    type: 'string',
    name: 'title',
    required: false,
  })
  @ApiQuery({
    type: 'string',
    name: 'discription',
    required: false,
  })
  @ApiQuery({
    type: 'string',
    name: 'page',
    required: false,
  })
  @ApiQuery({
    type: 'number',
    name: 'limit',
    required: false,
  })
  @ApiQuery({
    type: 'string',
    name: 'sortBy',
    required: false,
  })
  @ApiQuery({
    type: 'string',
    name: 'sortOrder',
    required: false,
  })
  @HttpCode(HttpStatus.OK)
  async getAllYolohead(@Req() req: Request) {
    const filters = pick(req.query, [
      'searchTerm',
      'heder',
      'hederDiscription',
      'title',
      'discription',
    ]);
    const params = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result = await this.yoloheatService.getAllYolohead(filters, params);

    return {
      message: 'yolohead retrieved successfully',
      meta: result.meta,
      data: result.data,
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'find single yolohead',
  })
  @HttpCode(HttpStatus.OK)
  async getSingleYolohead(@Param('id') id: string) {
    const result = await this.yoloheatService.getSingleYolohead(id);

    return {
      message: 'yolohead retrieved successfully',
      data: result,
    };
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'update yolohead',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @UseInterceptors(FileInterceptor('image', fileUpload.uploadConfig))
  @HttpCode(HttpStatus.OK)
  async updateYolohead(
    @Param('id') id: string,
    @Body() updateYoloheatDto: UpdateYoloheatDto,
    @UploadedFile()
    file?: Express.Multer.File,
  ) {
    const result = await this.yoloheatService.updateYolohead(
      id,
      updateYoloheatDto,
      file,
    );

    return {
      message: 'yolohead updated successfully',
      data: result,
    };
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'delete yolohead',
  })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  async deleteYolohead(@Param('id') id: string) {
    const result = await this.yoloheatService.deleteYoloheat(id);

    return {
      message: 'yolohead deleted successfully',
      data: result,
    };
  }
}
