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
  UploadedFile,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { BoxtService } from './boxt.service';
import { CreateBoxtDto } from './dto/create-boxt.dto';
import { UpdateBoxtDto } from './dto/update-boxt.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import AuthGuard from 'src/app/middlewares/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileUpload } from 'src/app/helpers/fileUploder';
import type { Request } from 'express';
import pick from 'src/app/helpers/pick';

@Controller('boxt')
export class BoxtController {
  constructor(private readonly boxtService: BoxtService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new Boxt' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateBoxtDto })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @UseInterceptors(FileInterceptor('image', fileUpload.uploadConfig))
  @HttpCode(HttpStatus.CREATED)
  async createBoxt(
    @Body() createBoxtDto: CreateBoxtDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const result = await this.boxtService.createBoxt(createBoxtDto, file);

    return {
      message: 'Boxt created successfully',
      data: result,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all Boxts' })
  @ApiQuery({ name: 'sortBy', required: false, example: 'createdAt' })
  @ApiQuery({ name: 'sortOrder', required: false, example: 'asc' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'searchTerm', required: false, example: 'name' })
  @ApiQuery({ name: 'title', required: false })
  @ApiQuery({ name: 'description', required: false })
  @HttpCode(HttpStatus.OK)
  async getAllBoxts(@Req() req: Request) {
    const filters = pick(req.query, ['searchTerm', 'title', 'description']);
    const options = pick(req.query, ['sortBy', 'sortOrder', 'page', 'limit']);
    const result = await this.boxtService.getAllBoxts(filters, options);
    return {
      message: 'Boxts retrieved successfully',
      meta: result.meta,
      data: result.data,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single Boxt by ID' })
  @HttpCode(HttpStatus.OK)
  async getSingleBoxt(@Param('id') id: string) {
    const result = await this.boxtService.getBoxtById(id);
    return {
      message: 'Boxt retrieved successfully',
      data: result,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a Boxt by ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateBoxtDto })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @UseInterceptors(FileInterceptor('image', fileUpload.uploadConfig))
  @HttpCode(HttpStatus.OK)
  async updateBoxt(
    @Param('id') id: string,
    @Body() updateBoxtDto: UpdateBoxtDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const result = await this.boxtService.updateBoxt(id, updateBoxtDto, file);
    return {
      message: 'Boxt updated successfully',
      data: result,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a Boxt by ID' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBoxt(@Param('id') id: string) {
    const result = await this.boxtService.deleteBoxt(id);
    return {
      message: 'Boxt deleted successfully',
      data: result,
    };
  }
}
