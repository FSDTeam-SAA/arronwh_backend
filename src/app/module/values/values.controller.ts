import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ValuesService } from './values.service';
import { CreateValueDto, ValueDataDto } from './dto/create-value.dto';
import { UpdateValueDataDto, UpdateValueDto } from './dto/update-value.dto';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import AuthGuard from 'src/app/middlewares/auth.guard';
import type { Request } from 'express';
import pick from 'src/app/helpers/pick';

@ApiTags('Values')
@Controller('values')
export class ValuesController {
  constructor(private readonly valuesService: ValuesService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new value',
  })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.CREATED)
  async createValues(@Body() createValueDto: CreateValueDto) {
    const result = await this.valuesService.createValue(createValueDto);
    return {
      message: 'Value created successfully',
      data: result,
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Get all values',
  })
  @ApiQuery({
    name: 'searchTram',
    required: false,
    description: 'Search term',
  })
  @ApiQuery({
    name: 'valueTitle',
    required: false,
    description: 'Value title',
  })
  @ApiQuery({
    name: 'valueDetail',
    required: false,
    description: 'Value detail',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Limit',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'Sort by',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Sort order',
  })
  @HttpCode(HttpStatus.OK)
  async findAllValues(@Req() req: Request) {
    const filters = pick(req.query, [
      'searchTerm',
      'valueTitle',
      'valueDetail',
    ]);
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result = await this.valuesService.findAllValues(filters, options);
    return {
      message: 'Values fetched successfully',
      data: result.data,
      meta: result.meta,
    };
  }

  @Get('data')
  @ApiOperation({
    summary: 'Get all value data',
  })
  @ApiQuery({
    name: 'searchTram',
    required: false,
    description: 'Search term',
  })
  @ApiQuery({
    name: 'valueTitle',
    required: false,
    description: 'Value title',
  })
  @ApiQuery({
    name: 'valueDetail',
    required: false,
    description: 'Value detail',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Limit',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'Sort by',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Sort order',
  })
  @HttpCode(HttpStatus.OK)
  async findAllValueData(@Req() req: Request) {
    const filters = pick(req.query, [
      'searchTerm',
      'valueTitle',
      'valueDetail',
    ]);
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result = await this.valuesService.findAllValueData(filters, options);
    return {
      message: 'Value Data fetched successfully',
      data: result.data,
      meta: result.meta,
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a single value',
  })
  @HttpCode(HttpStatus.OK)
  async findOneValue(@Param('id') id: string) {
    const result = await this.valuesService.findOneValue(id);
    return {
      message: 'Value fetched successfully',
      data: result,
    };
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a single value',
  })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  async updateValue(
    @Param('id') id: string,
    @Body() updateValueDto: UpdateValueDto,
  ) {
    const result = await this.valuesService.updateValue(id, updateValueDto);
    return {
      message: 'Value updated successfully',
      data: result,
    };
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a single value',
  })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  async deleteValue(@Param('id') id: string) {
    const result = await this.valuesService.deleteValue(id);
    return {
      message: 'Value deleted successfully',
      data: result,
    };
  }

  @Post('data')
  @ApiOperation({
    summary: 'Create a new value data',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @UseInterceptors(FileInterceptor('image'))
  @HttpCode(HttpStatus.CREATED)
  async createValueData(
    @Body() valueDataDto: ValueDataDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const result = await this.valuesService.createValueData(valueDataDto, file);
    return {
      message: 'Value Data created successfully',
      data: result,
    };
  }

  @Get('data/:id')
  @ApiOperation({
    summary: 'Get a single value data',
  })
  @HttpCode(HttpStatus.OK)
  async findOneValueData(@Param('id') id: string) {
    const result = await this.valuesService.findOneValueData(id);
    return {
      message: 'Value Data fetched successfully',
      data: result,
    };
  }

  @Patch('data/:id')
  @ApiOperation({
    summary: 'Update a single value data',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @UseInterceptors(FileInterceptor('image'))
  @HttpCode(HttpStatus.OK)
  async updateValueData(
    @Param('id') id: string,
    @Body() updateValueDataDto: UpdateValueDataDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const result = await this.valuesService.updateValueData(
      id,
      updateValueDataDto,
      file,
    );
    return {
      message: 'Value Data updated successfully',
      data: result,
    };
  }

  @Delete('data/:id')
  @ApiOperation({
    summary: 'Delete a single value data',
  })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  async deleteValueData(@Param('id') id: string) {
    const result = await this.valuesService.deleteValueData(id);
    return {
      message: 'Value Data deleted successfully',
      data: result,
    };
  }
}
