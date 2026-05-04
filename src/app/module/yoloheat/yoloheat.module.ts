import { Module } from '@nestjs/common';
import { YoloheatService } from './yoloheat.service';
import { YoloheatController } from './yoloheat.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Yoloheat, YoloheatSchema } from './entities/yoloheat.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Yoloheat.name, schema: YoloheatSchema },
    ]),
  ],
  controllers: [YoloheatController],
  providers: [YoloheatService],
})
export class YoloheatModule {}
