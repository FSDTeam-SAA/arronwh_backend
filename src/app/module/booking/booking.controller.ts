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
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { ApiBody, ApiOperation, ApiQuery } from '@nestjs/swagger';

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
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @HttpCode(HttpStatus.OK)
  async getAllBookings(
    @Query('searchTerm') searchTerm?: string,
    @Query('limit') limit?: number,
    @Query('page') page?: number,
  ) {
    const filters = searchTerm ? { searchTerm } : {};
    const options = { limit, page };
    const result = await this.bookingService.getAllBookings(filters, options);
    return {
      message: 'Bookings fetched successfully',
      data: result,
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
}
