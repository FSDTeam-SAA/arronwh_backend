import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { ControllerService } from './controller.service';
import { CreateControllerDto } from './dto/create-controller.dto';
import { UpdateControllerDto } from './dto/update-controller.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import AuthGuard from 'src/app/middlewares/auth.guard';
import pick from 'src/app/helpers/pick';
import type { Request } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';
import { fileUpload } from 'src/app/helpers/fileUploder';

@ApiTags('controller')
@Controller('controller')
export class ControllerController {
  constructor(private readonly controllerService: ControllerService) {}

@Post()
@ApiOperation({ summary: 'Create a new controller' })
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('admin'))
@ApiConsumes('multipart/form-data')
@UseInterceptors(FilesInterceptor('images', 10, fileUpload.uploadConfig))
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      title: { type: 'string', example: '' },
      description: { type: 'string', example: '' },
      badges: {
        type: 'array',
        items: { type: 'string' },
        example: ['OUR BEST SELLER', 'Latest Model'],
      },
      price: { type: 'number', example: 299.99 },
      discount: { type: 'number', example: 10 },
      images: {
        type: 'array',
        items: { type: 'string', format: 'binary' },
      },
    },
  },
})
@HttpCode(HttpStatus.CREATED)
async create(
  @Req() req: Request,                        // ← changed from @Body() dto
  @UploadedFiles() files: Express.Multer.File[],
) {
  console.log('Received body:', req.body);    // ← now you'll see the actual data
  const result = await this.controllerService.create(req.body, files);
  return {
    message: 'Controller created successfully',
    data: result,
  };
}

  @Get()
  @ApiOperation({ summary: 'Get all controllers' })
  @ApiQuery({ name: 'searchTerm', required: false, type: String, example: '' })
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
  @HttpCode(HttpStatus.OK)
  async getAll(@Req() req: Request) {
    const filters = pick(req.query, ['searchTerm']);
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result = await this.controllerService.getAll(filters, options);
    return {
      message: 'Controllers retrieved successfully',
      meta: result.meta,
      data: result.data,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single controller by ID' })
  @HttpCode(HttpStatus.OK)
  async getSingle(@Param('id') id: string) {
    const result = await this.controllerService.getSingle(id);
    return {
      message: 'Controller retrieved successfully',
      data: result,
    };
  }

  @Put(':id')
@ApiOperation({ summary: 'Update a controller' })
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('admin'))
@ApiConsumes('multipart/form-data')
@UseInterceptors(FilesInterceptor('images', 10, fileUpload.uploadConfig))
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      title: { type: 'string', example: '' },
      description: { type: 'string', example: '' },
      badges: {
        type: 'array',
        items: { type: 'string' },
        example: ['OUR BEST SELLER'],
      },
      price: { type: 'number', example: 299.99 },
      discount: { type: 'number', example: 10 },
      images: {
        type: 'array',
        items: { type: 'string', format: 'binary' },
      },
    },
  },
})
@HttpCode(HttpStatus.OK)
async update(
  @Param('id') id: string,
  @Req() req: Request,
  @UploadedFiles() files?: Express.Multer.File[],
) {
  const result = await this.controllerService.update(id, req.body, files);
  return {
    message: 'Controller updated successfully',
    data: result,
  };
}

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a controller' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string) {
    const result = await this.controllerService.delete(id);
    return {
      message: 'Controller deleted successfully',
      data: result,
    };
  }
}