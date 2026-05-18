import { Module } from '@nestjs/common';
import { ValuesService } from './values.service';
import { ValuesController } from './values.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Value,
  ValueData,
  ValueDataSchema,
  ValueSchema,
} from './entities/value.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Value.name, schema: ValueSchema },
      { name: ValueData.name, schema: ValueDataSchema },
    ]),
  ],
  controllers: [ValuesController],
  providers: [ValuesService],
})
export class ValuesModule {}
