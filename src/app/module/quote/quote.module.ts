import { Module } from '@nestjs/common';
import { QuoteService } from './quote.service';
import { QuoteController } from './quote.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Quote, QuoteSchema } from './entities/quote.entity';

import {
  BoilerController,
  BoilerControllerSchema,
} from '../controller/entities/controller.entities';
import { Extra, ExtraSchema } from '../extra/entities/extra.entities';
import { Product, ProductSchema } from '../product/entitiy/product.entitiy';
import { Payment, PaymentSchema } from '../payment/entities/payment.entity';
import { QuoteCronService } from './quote.cron.service';
import { User, UserSchema } from '../user/entities/user.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Quote.name, schema: QuoteSchema },
      { name: Product.name, schema: ProductSchema },
      { name: BoilerController.name, schema: BoilerControllerSchema },
      { name: Extra.name, schema: ExtraSchema },
      { name: Payment.name, schema: PaymentSchema },
      {name: User.name, schema: UserSchema}
    ]),
  ],
  controllers: [QuoteController],
  providers: [QuoteService, QuoteCronService],
})
export class QuoteModule {}
