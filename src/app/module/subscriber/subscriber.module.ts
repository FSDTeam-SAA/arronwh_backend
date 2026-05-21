import { Module } from '@nestjs/common';
import { SubscriberController } from './subscriber.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Quote, QuoteSchema } from '../quote/entities/quote.entity';
import { Subscriber, SubscriberSchema } from './entities/subscriber.entity';
import { SubscriberService } from './subscriber.sevice';
import { Product, ProductSchema } from '../product/entitiy/product.entitiy';
import {
  BoilerController,
  BoilerControllerSchema,
} from '../controller/entities/controller.entities';
import { Extra, ExtraSchema } from '../extra/entities/extra.entities';
import { User, UserSchema } from '../user/entities/user.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Subscriber.name, schema: SubscriberSchema },
      { name: Quote.name, schema: QuoteSchema },
      { name: Product.name, schema: ProductSchema },
      { name: BoilerController.name, schema: BoilerControllerSchema },
      { name: Extra.name, schema: ExtraSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [SubscriberController],
  providers: [SubscriberService],
})
export class SubscriberModule {}
