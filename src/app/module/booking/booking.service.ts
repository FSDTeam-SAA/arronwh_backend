import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Booking, BookingDocument } from './entities/booking.entity';
import { User, UserDocument } from '../user/entities/user.entity';
import { Service, ServiceDocument } from '../service/entities/service.entity';
import { IFilterParams } from 'src/app/helpers/pick';
import paginationHelper, { IOptions } from 'src/app/helpers/pagenation';
import buildWhereConditions from 'src/app/helpers/buildWhereConditions';

@Injectable()
export class BookingService {
  constructor(
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Service.name)
    private readonly serviceModel: Model<ServiceDocument>,
  ) {}

  async create(userId: string, createBookingDto: CreateBookingDto) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new HttpException('User not found', 404);
    }

    if (createBookingDto.service) {
      const service = await this.serviceModel.findById(createBookingDto.service);
      if (!service) {
        throw new HttpException('Service not found', 404);
      }
    }

    const booking = await this.bookingModel.create({
      ...createBookingDto,
      user: userId,
      date: createBookingDto.date ?? new Date().toISOString().slice(0, 10),
      due: createBookingDto.due ?? '',
      status: createBookingDto.status ?? 'pending',
      paymentStatus: createBookingDto.paymentStatus ?? 'unpaid',
      quizAnswers: createBookingDto.quizAnswers ?? [],
      selectedOptions: createBookingDto.selectedOptions ?? [],
      bookingCalendar: createBookingDto.bookingCalendar ?? [],
    });

    return booking;
  }

  async findAll(params: IFilterParams, options: IOptions) {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper(options);
    const whereConditions = buildWhereConditions(params, [
      'customerName',
      'email',
      'phoneNumber',
      'bookingType',
      'status',
      'paymentStatus',
      'bookingBy',
    ]);

    const total = await this.bookingModel.countDocuments(whereConditions);
    const data = await this.bookingModel
      .find(whereConditions)
      .sort({ [sortBy]: sortOrder } as never)
      .skip(skip)
      .limit(limit)
      .populate('user', 'fullName email')
      .populate('service', 'title price');

    return {
      meta: {
        total,
        page,
        limit,
      },
      data,
    };
  }

  async findOne(id: string) {
    const booking = await this.bookingModel
      .findById(id)
      .populate('user', 'fullName email phoneNumber')
      .populate('service', 'title price images');

    if (!booking) {
      throw new HttpException('Booking not found', 404);
    }

    return booking;
  }

  async update(id: string, updateBookingDto: UpdateBookingDto) {
    const booking = await this.bookingModel.findById(id);
    if (!booking) {
      throw new HttpException('Booking not found', 404);
    }

    if (updateBookingDto.service) {
      const service = await this.serviceModel.findById(updateBookingDto.service);
      if (!service) {
        throw new HttpException('Service not found', 404);
      }
    }

    return this.bookingModel.findByIdAndUpdate(id, updateBookingDto, {
      new: true,
    });
  }

  async remove(id: string) {
    const booking = await this.bookingModel.findById(id);
    if (!booking) {
      throw new HttpException('Booking not found', 404);
    }

    return booking.deleteOne();
  }
}
