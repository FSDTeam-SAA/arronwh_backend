import { Module } from '@nestjs/common';
import { CustomersayService } from './customersay.service';
import { CustomersayController } from './customersay.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Customersay, CustomersaySchema } from './entities/customersay.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Customersay.name, schema: CustomersaySchema },
    ]),
  ],
  controllers: [CustomersayController],
  providers: [CustomersayService],
})
export class CustomersayModule {}
