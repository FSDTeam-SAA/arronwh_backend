import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Put,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { HeadofficeService } from './headoffice.service';
import { CreateHeadofficeDto } from './dto/create-headoffice.dto';
import { UpdateHeadofficeDto } from './dto/update-headoffice.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import AuthGuard from 'src/app/middlewares/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileUpload } from 'src/app/helpers/fileUploder';


@ApiTags('headoffice')
@Controller('headoffice')
export class HeadofficeController {
  constructor(private readonly headofficeService: HeadofficeService) {}

  @Post()
  @ApiOperation({ summary: 'Create headoffice with banner image' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @UseInterceptors(FileInterceptor('bannerImage', fileUpload.uploadConfig))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        bannerImage: {
          type: 'string',
          format: 'binary',
          description: 'Banner image',
        },
        header: { type: 'string', example: 'Our Head Office' },
        description: { type: 'string', example: 'We are located at...' },
      },
    },
  })
  @HttpCode(HttpStatus.CREATED)
  async createHeadoffice(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateHeadofficeDto,
  ) {
    const result = await this.headofficeService.createHeadoffice(dto, file);
    return { message: 'Headoffice created successfully', data: result };
  }

  @Get()
  @ApiOperation({ summary: 'Get all headoffices' })
  @HttpCode(HttpStatus.OK)
  async findAllHeadoffices() {
    const result = await this.headofficeService.findAllHeadoffices();
    return { message: 'Headoffices fetched successfully', data: result };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single headoffice by id' })
  @HttpCode(HttpStatus.OK)
  async findOneHeadoffice(@Param('id') id: string) {
    const result = await this.headofficeService.findOneHeadoffice(id);
    return { message: 'Headoffice fetched successfully', data: result };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update headoffice by id' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @UseInterceptors(FileInterceptor('bannerImage', fileUpload.uploadConfig))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        bannerImage: {
          type: 'string',
          format: 'binary',
          description: 'Banner image (optional)',
        },
        header: { type: 'string', example: 'Our Head Office' },
        description: { type: 'string', example: 'We are located at...' },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async updateHeadoffice(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UpdateHeadofficeDto,
  ) {
    const result = await this.headofficeService.updateHeadoffice(id, dto, file);
    return { message: 'Headoffice updated successfully', data: result };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete headoffice by id' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  async deleteHeadoffice(@Param('id') id: string) {
    const result = await this.headofficeService.deleteHeadoffice(id);
    return { message: 'Headoffice deleted successfully', data: result };
  }
}
