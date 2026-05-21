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
  Res,
  Req,
  Put,
} from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import AuthGuard from 'src/app/middlewares/auth.guard';
import type { Request } from 'express';
import pick from 'src/app/helpers/pick';

@ApiTags('sales')
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @ApiOperation({ summary: 'sale create successfully' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.CREATED)
  async createSale(@Body() createSaleDto: CreateSaleDto) {
    const result = await this.salesService.createSale(createSaleDto);

    return {
      message: 'sale created successfully',
      data: result,
    };
  }

  @Get()
  @ApiOperation({ summary: 'get all sale with pagination and filters' })
  @ApiQuery({
    name: 'searchTerm',
    required: false,
    type: String,
    example: '',
    description: 'Search by ',
  })
  @ApiQuery({
    name: 'title',
    required: false,
    type: String,
    example: '',
    description: 'Filter by exact title',
  })
  @ApiQuery({
    name: 'subTitle',
    required: false,
    type: String,
    example: '',
    description: 'Filter by exact subTitle value',
  })
  @ApiQuery({
    name: 'phoneNumber',
    required: false,
    type: String,
    example: '',
    description: 'Filter by phoneNumber value',
  })
  @ApiQuery({
    name: 'description',
    required: false,
    type: String,
    example: '',
    description: 'Filter by description value',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Page number. Default is 1',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
    description: 'Items per page. Default is 10',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    example: 'createdAt',
    description: 'Sort field. Default is createdAt',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    example: 'desc',
    description: 'Sort order. Default is desc',
  })
  @HttpCode(HttpStatus.OK)
  async findAllSales(@Req() req: Request) {
    const filter = pick(req.query, [
      'searchTerm',
      'title',
      'subTitle',
      'phonenumber',
      'description',
    ]);
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result = await this.salesService.findAllSales(filter, options);
    return {
      message: 'sale fetched successfully',
      meta: result.mata,
      data: result.data,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'get single sale by id' })
  @HttpCode(HttpStatus.OK)
  async findOneSale(@Param('id') id: string) {
    const result = await this.salesService.findOneSale(id);
    return {
      message: 'sale fetched successfully',
      data: result,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'update sale by id' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  async updateSale(
    @Param('id') id: string,
    @Body() updateSaleDto: UpdateSaleDto,
  ) {
    const result = await this.salesService.updateSale(id, updateSaleDto);

    return {
      message: 'sale updated successfully',
      data: result,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'delete sale by id' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  async deleteSale(@Param('id') id: string) {
    const result = await this.salesService.deleteSale(id);

    return {
      message: 'sale deleted successfully',
      data: result,
    };
  }
}
