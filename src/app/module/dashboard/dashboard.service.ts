import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../user/entities/user.entity';
import { Booking, BookingDocument } from '../booking/entities/booking.entity';
import { Payment, PaymentDocument } from '../payment/entities/payment.entity';
import { Contact, ContactDocument } from '../contact/entities/contact.entity';

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
  ) {}

  async getDashboardOverview() {
    const [
      customerCount,
      totalBookings,
      completedBookings,
      pendingBookings,
      totalRevenueResult,
      currentMonthRevenueResult,
      previousMonthRevenueResult,
      recentBookings,
      monthlyRevenueRaw,
      recentContacts,
    ] = await Promise.all([
      this.userModel.countDocuments({ role: 'user' }),
      this.bookingModel.countDocuments(),
      this.bookingModel.countDocuments({ status: 'completed' }),
      this.bookingModel.countDocuments({ status: 'pending' }),
      this.paymentModel.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      this.paymentModel.aggregate([
        {
          $match: {
            status: 'completed',
            createdAt: {
              $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
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
              $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
              $lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      this.bookingModel
        .find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select(
          'customerName email phoneNumber bookingType status createdAt paymentStatus',
        ),
      this.paymentModel.aggregate([
        { $match: { status: 'completed' } },
        {
          $group: {
            _id: { $month: '$createdAt' },
            total: { $sum: '$amount' },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      this.contactModel
        .find()
        .sort({ createdAt: -1 })
        .limit(3)
        .select('fullName email phoneNumber createdAt'),
    ]);

    const totalRevenue = totalRevenueResult[0]?.total ?? 0;
    const currentMonthRevenue = currentMonthRevenueResult[0]?.total ?? 0;
    const previousMonthRevenue = previousMonthRevenueResult[0]?.total ?? 0;
    const revenueGrowth =
      previousMonthRevenue > 0
        ? (((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100).toFixed(1)
        : currentMonthRevenue > 0
          ? '100.0'
          : '0.0';

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

    const earningOverview = monthNames.map((month, index) => ({
      month,
      revenue: monthlyRevenueMap.get(index + 1) ?? 0,
    }));

    return {
      summaryCards: [
        {
          title: 'Active Customers',
          value: customerCount,
          subtitle: `${pendingBookings} pending`,
        },
        {
          title: 'Revenue',
          value: totalRevenue,
          subtitle: `+${revenueGrowth}%`,
        },
        {
          title: 'Total Bookings',
          value: totalBookings,
          subtitle: `${completedBookings} completed`,
        },
        {
          title: 'Bookings',
          value: totalBookings,
          subtitle: `Done ${completedBookings} / Pending ${pendingBookings}`,
        },
      ],
      earningOverview,
      aiPerformance: [
        {
          title: 'Quiz Generated',
          value: totalBookings,
        },
        {
          title: 'Failed Payment',
          value: await this.paymentModel.countDocuments({ status: 'failed' }),
        },
        {
          title: 'Unread Contact',
          value: await this.contactModel.countDocuments(),
        },
      ],
      recentActivities: recentBookings.map((booking) => {
        const bookingItem = booking as typeof booking & { createdAt?: Date };
        return {
          name: booking.customerName,
          email: booking.email,
          phone: booking.phoneNumber,
          action: booking.bookingType || 'Booking Created',
          time: bookingItem.createdAt,
          status: booking.status,
        };
      }),
      recentContacts: recentContacts.map((contact) => {
        const contactItem = contact as typeof contact & { createdAt?: Date };
        return {
          name: contact.fullName,
          email: contact.email,
          phone: contact.phoneNumber,
          time: contactItem.createdAt,
        };
      }),
    };
  }
}
