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
} from '@nestjs/common';
import { CustomersayService } from './customersay.service';
import { CreateCustomersayDto } from './dto/create-customersay.dto';
import { UpdateCustomersayDto } from './dto/update-customersay.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import AuthGuard from 'src/app/middlewares/auth.guard';
import type { Request } from 'express';
import pick from 'src/app/helpers/pick';

@ApiTags('customersay')
@Controller('customersay')
export class CustomersayController {
  constructor(private readonly customersayService: CustomersayService) {}

  @Post()
  @ApiOperation({
    summary: 'create customersay',
  })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.CREATED)
  async createCustomersay(@Body() createCustomersayDto: CreateCustomersayDto) {
    const result =
      await this.customersayService.createCustomersay(createCustomersayDto);

    return {
      message: 'customersay create successfully',
      data: result,
    };
  }

  @Get()
  @ApiOperation({
    summary: 'get all customersay',
  })
  @ApiQuery({
    name: 'searchTerm',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'title',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'description',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'review',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'rating',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'location',
    required: false,
    type: String,
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
  @HttpCode(HttpStatus.OK)
  async getAllCustomersay(@Req() req: Request) {
    const filters = pick(req.query, [
      'searchTerm',
      'title',
      'description',
      'review',
      'rating',
      'name',
      'location',
    ]);
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result = await this.customersayService.getAllCustomersay(
      filters,
      options,
    );

    return {
      message: 'customersay fetched successfully',
      meta: result.meta,
      data: result.data,
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'get customersay',
  })
  @HttpCode(HttpStatus.OK)
  async getsingleCustomersay(@Param('id') id: string) {
    const result = await this.customersayService.getsingleCustomersay(id);

    return {
      message: 'customersay fetched successfully',
      data: result,
    };
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'update customersay',
  })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  async updateCustomersay(
    @Param('id') id: string,
    @Body() updateCustomersayDto: UpdateCustomersayDto,
  ) {
    const result = await this.customersayService.updateCustomersay(
      id,
      updateCustomersayDto,
    );

    return {
      message: 'customersay updated successfully',
      data: result,
    };
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'delete customersay',
  })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  async deleteCustomersay(@Param('id') id: string) {
    const result = await this.customersayService.deleteCustomersay(id);

    return {
      message: 'customersay deleted successfully',
      data: result,
    };
  }
}
