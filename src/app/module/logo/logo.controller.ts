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
import { LogoService } from './logo.service';
import { CreateLogoDto } from './dto/create-logo.dto';
import { UpdateLogoDto } from './dto/update-logo.dto';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { fileUpload } from 'src/app/helpers/fileUploder';
import AuthGuard from 'src/app/middlewares/auth.guard';
import type { Request } from 'express';
import pick from 'src/app/helpers/pick';

@ApiTags('logo')
@Controller('logo')
export class LogoController {
  constructor(private readonly logoService: LogoService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new logo' })
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @UseInterceptors(FileInterceptor('image', fileUpload.uploadConfig))
  @HttpCode(HttpStatus.CREATED)
  async createLogo(
    @Body() createLogoDto: CreateLogoDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const result = await this.logoService.createLogo(createLogoDto, file);
    return {
      message: 'Logo created successfully',
      data: result,
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Get the all logo',
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
  async findAllLogo(@Req() req: Request) {
    const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);
    const result = await this.logoService.findAllLogo(options);
    return {
      message: 'Logo fetched successfully',
      meta: result.meta,
      data: result.data,
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a logo by ID',
  })
  @HttpCode(HttpStatus.OK)
  async findOneLogo(@Param('id') id: string) {
    const result = await this.logoService.findOneLogo(id);
    console.log(result);
    
    return {
      message: 'Logo fetched successfully',
      data: result,
    };
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a logo by ID',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @UseInterceptors(FileInterceptor('image', fileUpload.uploadConfig))
  @HttpCode(HttpStatus.OK)
  async updateLogo(@Param('id') id: string, @Body() updateLogoDto: UpdateLogoDto, @UploadedFile() file: Express.Multer.File) {
    const result = await this.logoService.updateLogo(id, updateLogoDto, file);
    return {
      message: 'Logo updated successfully',
      data: result,
    };
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a logo by ID',
  })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  async removeLogo(@Param('id') id: string) {
    const result = await this.logoService.removeLogo(id);
    return {
      message: 'Logo deleted successfully',
      data: result,
    };
  }
}
