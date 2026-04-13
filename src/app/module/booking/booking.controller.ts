import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import type { Request } from 'express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import AuthGuard from 'src/app/middlewares/auth.guard';
import pick from 'src/app/helpers/pick';

@ApiTags('Booking')
@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin', 'user'))
  @ApiBody({ type: CreateBookingDto })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Req() req: Request,
    @Body() createBookingDto: CreateBookingDto,
  ) {
    const result = await this.bookingService.create(
      req.user!.id,
      createBookingDto,
    );
    return {
      message: 'Booking created successfully',
      data: result,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all bookings' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @ApiQuery({ name: 'searchTerm', required: false, type: String, example: '' })
  @ApiQuery({ name: 'status', required: false, type: String, example: '' })
  @ApiQuery({
    name: 'paymentStatus',
    required: false,
    type: String,
    example: '',
  })
  @ApiQuery({ name: 'bookingType', required: false, type: String, example: '' })
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
  async findAll(@Req() req: Request) {
    const filters = pick(req.query, [
      'searchTerm',
      'status',
      'paymentStatus',
      'bookingType',
    ]);
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result = await this.bookingService.findAll(filters, options);
    return {
      message: 'Bookings retrieved successfully',
      meta: result.meta,
      data: result.data,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking by ID' })
  @ApiParam({ name: 'id', type: String, example: '67f1234567890abcdef1234' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin', 'user'))
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    const result = await this.bookingService.findOne(id);
    return {
      message: 'Booking retrieved successfully',
      data: result,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update booking by ID' })
  @ApiParam({ name: 'id', type: String, example: '67f1234567890abcdef1234' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @ApiBody({ type: UpdateBookingDto })
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto,
  ) {
    const result = await this.bookingService.update(id, updateBookingDto);
    return {
      message: 'Booking updated successfully',
      data: result,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete booking by ID' })
  @ApiParam({ name: 'id', type: String, example: '67f1234567890abcdef1234' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    const result = await this.bookingService.remove(id);
    return {
      message: 'Booking deleted successfully',
      data: result,
    };
  }
}
