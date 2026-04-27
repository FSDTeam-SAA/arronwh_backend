import { Injectable, BadRequestException, HttpException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booking, BookingDocument } from './entities/booking.entity';
import { Quote, QuoteDocument } from '../quote/entities/quote.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { IFilterParams } from 'src/app/helpers/pick';
import paginationHelper, { IOptions } from 'src/app/helpers/pagenation';
import buildWhereConditions from 'src/app/helpers/buildWhereConditions';

@Injectable()
export class BookingService {
  constructor(
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
    @InjectModel(Quote.name)
    private readonly quoteModel: Model<QuoteDocument>,
  ) {}

  async createBooking(createBookingDto: CreateBookingDto) {
    const { quote, price } = createBookingDto;

    const quoteExists = await this.quoteModel.findById(quote);
    if (!quoteExists) {
      throw new BadRequestException(`Quote with id ${quote} not found.`);
    }

    // const existingBooking = await this.bookingModel.findOne({ quote });
    // if (existingBooking) {
    //   throw new BadRequestException(
    //     `Booking already exists for quote ${quote}.`,
    //   );
    // }

    const newBooking = new this.bookingModel({ quote, price });
    await newBooking.save();
    return newBooking;
  }

  async getAllBookings(params: IFilterParams, options: IOptions) {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper(options);
    const whereConditions = buildWhereConditions(params, [
      'status',
      'bookingFor',
    ]);

    const total = await this.bookingModel.countDocuments(whereConditions);
    const bookings = await this.bookingModel
      .find(whereConditions)
      .sort({ [sortBy]: sortOrder } as any)
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'quote',
        populate: [
          { path: 'productId' },
          { path: 'controller' },
          { path: 'extra' },
        ],
      });

    return {
      data: bookings,
      meta: {
        total,
        page,
        limit,
      },
    };
  }

  async getSingleBooking(id: string) {
    const booking = await this.bookingModel.findById(id).populate({
      path: 'quote',
      populate: [
        { path: 'productId' },
        { path: 'controller' },
        { path: 'extra' },
      ],
    });

    if (!booking) {
      throw new BadRequestException(`Booking with id ${id} not found.`);
    }

    return booking;
  }

  async deleteBooking(id: string) {
    const booking = await this.bookingModel.findById(id);
    if (!booking) {
      throw new BadRequestException(`Booking with id ${id} not found.`);
    }

    await this.bookingModel.findByIdAndDelete(id);
    return { message: `Booking with id ${id} has been deleted.` };
  }

  async bookingForUpdate(id: string, bookingFor: string) {
    const booking = await this.bookingModel.findById(id);
    if (!booking) throw new HttpException('Booking is not found', 404);

    const result = await this.bookingModel.findByIdAndUpdate(
      id,
      {
        bookingFor,
      },
      { new: true },
    );

    return result;
  }
}
