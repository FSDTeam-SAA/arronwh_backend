import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IFilterParams } from 'src/app/helpers/pick';
import paginationHelper, { IOptions } from 'src/app/helpers/pagenation';
import { fileUpload } from 'src/app/helpers/fileUploder';
import { Extra, ExtraDocument } from './entities/extra.entities';
import { Quote, QuoteDocument } from '../quote/entities/quote.entity';
import { Booking, BookingDocument } from '../booking/entities/booking.entity';

const extraSearchableFields = ['title'];

@Injectable()
export class ExtraService {
  constructor(
    @InjectModel(Extra.name)
    private readonly extraModel: Model<ExtraDocument>,
    @InjectModel(Quote.name) private readonly quoteModel: Model<QuoteDocument>,
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
  ) {}

  private async getBookingCountMap(): Promise<Map<string, number>> {
    const bookingCounts = await this.bookingModel.aggregate([
      {
        $lookup: {
          from: this.quoteModel.collection.name,
          localField: 'quote',
          foreignField: '_id',
          as: 'quoteData',
        },
      },
      { $unwind: '$quoteData' },
      {
        $match: {
          'quoteData.extra': {
            $exists: true,
            $ne: null,
          },
        },
      },
      {
        $group: {
          _id: '$quoteData.extra',
          bookingCount: { $sum: 1 },
        },
      },
    ]);

    return new Map(
      bookingCounts.map((item) => [String(item._id), Number(item.bookingCount)]),
    );
  }

  private compareValues(a: unknown, b: unknown, sortOrder: string) {
    const direction = sortOrder === 'asc' ? 1 : -1;

    if (a instanceof Date && b instanceof Date) {
      return (a.getTime() - b.getTime()) * direction;
    }

    if (typeof a === 'number' && typeof b === 'number') {
      return (a - b) * direction;
    }

    return String(a ?? '').localeCompare(String(b ?? '')) * direction;
  }

  async create(body: any, files?: Express.Multer.File[]) {
    const payload: any = {
      title: body.title,
      description: body.description,
      badges:
        typeof body.badges === 'string' ? [body.badges] : (body.badges ?? []),
      price: Number(body.price),
      discount: body.discount ? Number(body.discount) : 0,
      images: [],
    };

    if (files && files.length > 0) {
      const uploadedUrls = await Promise.all(
        files.map((file) =>
          fileUpload.uploadToCloudinary(file).then((res) => res.url),
        ),
      );
      payload.images = uploadedUrls;
    }

    const extra = await this.extraModel.create(payload);
    return extra;
  }

  async getAll(params: IFilterParams, options: IOptions) {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper(options);
    const { searchTerm, ...filterData } = params;

    let whereConditions: any = {};

    if (searchTerm) {
      whereConditions.$or = extraSearchableFields.map((field) => ({
        [field]: { $regex: searchTerm, $options: 'i' },
      }));
    }

    if (Object.keys(filterData).length) {
      whereConditions.$and = Object.entries(filterData).map(([key, value]) => ({
        [key]: value,
      }));
    }

    const [total, extras, bookingCountMap] = await Promise.all([
      this.extraModel.countDocuments(whereConditions),
      this.extraModel.find(whereConditions).lean(),
      this.getBookingCountMap(),
    ]);

    const highestBookingCount = extras.reduce((max, extra) => {
      const bookingCount = bookingCountMap.get(String(extra._id)) ?? 0;
      return Math.max(max, bookingCount);
    }, 0);

    const data = extras
      .map((extra) => {
        const bookingCount = bookingCountMap.get(String(extra._id)) ?? 0;
        return {
          ...extra,
          bookingCount,
          isBestSeller:
            highestBookingCount > 0 && bookingCount === highestBookingCount,
        };
      })
      .sort((a, b) => {
        if (b.bookingCount !== a.bookingCount) {
          return b.bookingCount - a.bookingCount;
        }

        return this.compareValues(
          a[sortBy as keyof typeof a],
          b[sortBy as keyof typeof b],
          sortOrder,
        );
      })
      .slice(skip, skip + limit);

    return {
      meta: { page, limit, total },
      data,
    };
  }

  async getSingle(id: string) {
    const extra = await this.extraModel.findById(id);
    if (!extra) throw new HttpException('Extra not found', 404);
    return extra;
  }

  async update(id: string, body: any, files?: Express.Multer.File[]) {
    const extra = await this.extraModel.findById(id);
    if (!extra) throw new HttpException('Extra not found', 404);

    const payload: any = {};

    if (body.title !== undefined) payload.title = body.title;
    if (body.description !== undefined) payload.description = body.description;
    if (body.price !== undefined) payload.price = Number(body.price);
    if (body.discount !== undefined) payload.discount = Number(body.discount);
    if (body.badges !== undefined) {
      payload.badges =
        typeof body.badges === 'string' ? [body.badges] : body.badges;
    }

    if (files && files.length > 0) {
      const uploadedUrls = await Promise.all(
        files.map((file) =>
          fileUpload.uploadToCloudinary(file).then((res) => res.url),
        ),
      );
      payload.images = uploadedUrls;
    }

    const updated = await this.extraModel.findByIdAndUpdate(id, payload, {
      new: true,
    });
    return updated;
  }

  async delete(id: string) {
    const extra = await this.extraModel.findById(id);
    if (!extra) throw new HttpException('Extra not found', 404);
    return this.extraModel.findByIdAndDelete(id);
  }
}
