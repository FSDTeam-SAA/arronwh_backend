import { Module } from '@nestjs/common';
import { BoxtService } from './boxt.service';
import { BoxtController } from './boxt.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { BoxtSchema } from './entities/boxt.entity';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Boxt', schema: BoxtSchema }])],
  controllers: [BoxtController],
  providers: [BoxtService],
})
export class BoxtModule {}
