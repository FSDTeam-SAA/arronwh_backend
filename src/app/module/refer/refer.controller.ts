import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
  Put,
} from '@nestjs/common';
import { ReferService } from './refer.service';
import { CreateReferDto } from './dto/create-refer.dto';
import { UpdateReferDto } from './dto/update-refer.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import pick from 'src/app/helpers/pick';
import AuthGuard from 'src/app/middlewares/auth.guard';

@ApiTags('refer')
@Controller('refer')
export class ReferController {
  constructor(private readonly referService: ReferService) {}

  @Post()
  @ApiOperation({
    summary: 'create refer',
  })
  @ApiBody({
    type: CreateReferDto,
  })
  @HttpCode(HttpStatus.CREATED)
  async createRefer(@Body() createReferDto: CreateReferDto) {
    const result = await this.referService.createRefer(createReferDto);

    return {
      message: 'Refer create successfully',
      data: result,
    };
  }

  @Get()
  @ApiOperation({
    summary: 'get all refers',
  })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @ApiQuery({
    name: 'searchTerm',
    required: false,
    type: String,
    example: '',
    description:
      'Search by referred_by, name, email, phone, postcode, address, message',
  })
  @ApiQuery({
    name: 'referred_by',
    required: false,
    type: String,
    example: '',
    description: 'Filter by exact referred_by',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
    example: '',
    description: 'Filter by exact name',
  })
  @ApiQuery({
    name: 'email',
    required: false,
    type: String,
    example: '',
    description: 'Filter by exact email',
  })
  @ApiQuery({
    name: 'phone',
    required: false,
    type: String,
    example: '',
    description: 'Filter by phone',
  })
  @ApiQuery({
    name: 'postcode',
    required: false,
    type: String,
    example: '',
    description: 'Filter by postcode',
  })
  @ApiQuery({
    name: 'address',
    required: false,
    type: String,
    example: '',
    description: 'Filter by address',
  })
  @ApiQuery({
    name: 'message',
    required: false,
    type: String,
    example: '',
    description: 'Message by status value',
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
  async getAllRefers(@Req() req: Request) {
    const filters = pick(req.query, [
      'searchTerm',
      'referred_by',
      'name',
      'email',
      'phone',
      'postcode',
      'address',
      'message',
    ]);
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result = await this.referService.getAllRefers(filters, options);

    return {
      message: 'Refers retrieved successfully',
      meta: result.meta,
      data: result.data,
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'get refer by id',
  })
  async findRefer(@Param('id') id: string) {
    const result = await this.referService.getSingleRefer(id);

    return {
      message: 'Refer retrieved successfully',
      data: result,
    };
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'update refer by id',
  })
  @ApiBearerAuth('access-token')
  @ApiBody({ type: UpdateReferDto })
  @UseGuards(AuthGuard('admin'))
  async updateRefer(
    @Param('id') id: string,
    @Body() updateReferDto: UpdateReferDto,
  ) {
    const result = await this.referService.updateRefer(id, updateReferDto);

    return {
      message: 'Refer updated successfully',
      data: result,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'delete refer by id',
  })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  async deleteRefer(@Param('id') id: string) {
    const result = await this.referService.deleteRefer(id);

    return {
      message: 'Refer deleted successfully',
      data: result,
    };
  }
}
