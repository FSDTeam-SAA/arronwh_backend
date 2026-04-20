import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { User, UserSchema } from '../user/entities/user.entity';
import { Product, ProductSchema } from './entitiy/product.entitiy';
import { Quote, QuoteSchema } from '../quote/entities/quote.entity';
import { Booking, BookingSchema } from '../booking/entities/booking.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: User.name, schema: UserSchema },
      { name: Quote.name, schema: QuoteSchema },
      { name: Booking.name, schema: BookingSchema },
    ]),
  ],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
