import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../user/entities/user.entity';
import { Booking, BookingDocument } from '../booking/entities/booking.entity';
import { Payment, PaymentDocument } from '../payment/entities/payment.entity';
import { Contact, ContactDocument } from '../contact/entities/contact.entity';
import { Quote, QuoteDocument } from '../quote/entities/quote.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
    @InjectModel(Contact.name)
    private readonly contactModel: Model<ContactDocument>,
    @InjectModel(Quote.name)
    private readonly quoteModel: Model<QuoteDocument>,
  ) {}

  async getDashboardOverview() {
    const [
      totalRevenueResult,
      currentMonthRevenueResult,
      previousMonthRevenueResult,
      totalQuotes,
      currentMonthQuotes,
      previousMonthQuotes,
      totalBookings,
      surveyBookings,
      installBookings,
      confirmedBookings,
    ] = await Promise.all([
      this.paymentModel.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      this.paymentModel.aggregate([
        {
          $match: {
            status: 'completed',
            createdAt: {
              $gte: new Date(
                new Date().getFullYear(),
                new Date().getMonth(),
                1,
              ),
            },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      this.paymentModel.aggregate([
        {
          $match: {
            status: 'completed',
            createdAt: {
              $gte: new Date(
                new Date().getFullYear(),
                new Date().getMonth() - 1,
                1,
              ),
              $lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      this.quoteModel.countDocuments(),
      this.quoteModel.countDocuments({
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      }),
      this.quoteModel.countDocuments({
        createdAt: {
          $gte: new Date(
            new Date().getFullYear(),
            new Date().getMonth() - 1,
            1,
          ),
          $lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      }),
      this.bookingModel.countDocuments(),
      this.bookingModel.countDocuments({
        bookingFor: 'survey',
        status: 'confirmed',
      }),
      this.bookingModel.countDocuments({
        bookingFor: 'installation',
        status: 'confirmed',
      }),
      this.bookingModel.countDocuments({ status: 'confirmed' }),
    ]);

    const totalRevenue = totalRevenueResult[0]?.total ?? 0;
    const currentMonthRevenue = currentMonthRevenueResult[0]?.total ?? 0;
    const previousMonthRevenue = previousMonthRevenueResult[0]?.total ?? 0;
    const revenueGrowth =
      previousMonthRevenue > 0
        ? (
            ((currentMonthRevenue - previousMonthRevenue) /
              previousMonthRevenue) *
            100
          ).toFixed(1)
        : currentMonthRevenue > 0
          ? '100.0'
          : '0.0';

    const quoteGrowth =
      previousMonthQuotes > 0
        ? (
            ((currentMonthQuotes - previousMonthQuotes) / previousMonthQuotes) *
            100
          ).toFixed(1)
        : currentMonthQuotes > 0
          ? '100.0'
          : '0.0';

    const formatTrend = (val: number) =>
      val > 0 ? `+${val}% ↑` : val < 0 ? `${val}% ↓` : `0%`;

    return {
      summaryCards: [
        {
          title: 'Quotes Generated',
          value: totalQuotes,
          subtitle: formatTrend(Number(quoteGrowth)),
        },
        {
          title: 'Revenue',
          value: totalRevenue,
          subtitle: formatTrend(Number(revenueGrowth)),
        },
        {
          title: 'Total Bookings',
          value: totalBookings,
          subtitle: '',
        },
        {
          title: 'Bookings',
          value: confirmedBookings,
          subtitle: `Survey ${surveyBookings}\nInstalls ${installBookings}`,
        },
      ],
    };
  }

  async earningOverview(year?: number, type?: string) {
    const currentYear = year || new Date().getFullYear();

    let monthlyRevenueRaw: any[] = [];
    let monthlyBookingsRaw: any[] = [];

    const promises: Promise<any>[] = [];

    if (!type || type === 'revenue') {
      promises.push(
        this.paymentModel.aggregate([
          {
            $match: {
              status: 'completed',
              createdAt: {
                $gte: new Date(currentYear, 0, 1),
                $lt: new Date(currentYear + 1, 0, 1),
              },
            },
          },
          {
            $group: {
              _id: { $month: '$createdAt' },
              total: { $sum: '$amount' },
            },
          },
        ]).then((res) => {
          monthlyRevenueRaw = res;
        }),
      );
    }

    if (!type || type === 'bookings') {
      promises.push(
        this.bookingModel.aggregate([
          {
            $match: {
              createdAt: {
                $gte: new Date(currentYear, 0, 1),
                $lt: new Date(currentYear + 1, 0, 1),
              },
            },
          },
          {
            $group: {
              _id: { $month: '$createdAt' },
              count: { $sum: 1 },
            },
          },
        ]).then((res) => {
          monthlyBookingsRaw = res;
        }),
      );
    }

    await Promise.all(promises);

    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    const monthlyRevenueMap = new Map<number, number>(
      monthlyRevenueRaw.map((item) => [item._id, item.total]),
    );

    const monthlyBookingsMap = new Map<number, number>(
      monthlyBookingsRaw.map((item) => [item._id, item.count]),
    );

    const earningOverview = monthNames.map((month, index) => {
      const result: any = { month };
      if (!type || type === 'revenue') {
        result.revenue = monthlyRevenueMap.get(index + 1) ?? 0;
      }
      if (!type || type === 'bookings') {
        result.bookings = monthlyBookingsMap.get(index + 1) ?? 0;
      }
      return result;
    });

    return earningOverview;
  }
}
