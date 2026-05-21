import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Patch,
  Req,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import {
  CreateBookingDto,
  UpdateBookingForDto,
} from './dto/create-booking.dto';
import { ApiBody, ApiOperation, ApiQuery } from '@nestjs/swagger';
import pick from 'src/app/helpers/pick';
import type { Request } from 'express';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @ApiOperation({ summary: 'Create a booking from a quote' })
  @ApiBody({ type: CreateBookingDto })
  @HttpCode(HttpStatus.CREATED)
  async createBooking(@Body() createBookingDto: CreateBookingDto) {
    const result = await this.bookingService.createBooking(createBookingDto);
    return {
      message: 'Booking created successfully',
      data: result,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all bookings' })
  @ApiQuery({ name: 'searchTerm', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'bookingFor', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, type: String })
  @HttpCode(HttpStatus.OK)
  async getAllBookings(@Req() req: Request) {
    const filters = pick(req.query, ['searchTerm', 'status', 'bookingFor']);
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result = await this.bookingService.getAllBookings(filters, options);
    return {
      message: 'Bookings fetched successfully',
      meta: result.meta,
      data: result.data,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single booking' })
  @HttpCode(HttpStatus.OK)
  async getSingleBooking(@Param('id') id: string) {
    const result = await this.bookingService.getSingleBooking(id);
    return {
      message: 'Booking fetched successfully',
      data: result,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a booking' })
  @HttpCode(HttpStatus.OK)
  async deleteBooking(@Param('id') id: string) {
    const result = await this.bookingService.deleteBooking(id);
    return result;
  }

  @Patch('booking-for/:id')
  @ApiOperation({ summary: 'Update booking for' })
  @ApiBody({
    type: UpdateBookingForDto,
  })
  @HttpCode(HttpStatus.OK)
  async bookingForUpdate(
    @Param('id') id: string,
    @Body() bookingFor: UpdateBookingForDto,
  ) {
    const result = await this.bookingService.bookingForUpdate(
      id,
      bookingFor.bookingFor,
    );
    return {
      message: 'Booking for updated successfully',
      data: result,
    };
  }
}
