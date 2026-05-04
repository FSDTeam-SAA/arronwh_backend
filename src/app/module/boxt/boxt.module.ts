import { Module } from '@nestjs/common';
import { BoxtService } from './boxt.service';
import { BoxtController } from './boxt.controller';

@Module({
  controllers: [BoxtController],
  providers: [BoxtService],
})
export class BoxtModule {}
