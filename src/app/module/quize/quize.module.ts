import { Module } from '@nestjs/common';
import { QuizeService } from './quize.service';
import { QuizeController } from './quize.controller';

@Module({
  controllers: [QuizeController],
  providers: [QuizeService],
})
export class QuizeModule {}
