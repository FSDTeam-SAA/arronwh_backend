import { Module } from '@nestjs/common';
import { YoloheatService } from './yoloheat.service';
import { YoloheatController } from './yoloheat.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  HeaderData,
  HeaderDataSchema,
  Yoloheat,
  YoloheatSchema,
} from './entities/yoloheat.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Yoloheat.name, schema: YoloheatSchema },
      { name: HeaderData.name, schema: HeaderDataSchema },
    ]),
  ],
  controllers: [YoloheatController],
  providers: [YoloheatService],
})
export class YoloheatModule {}
