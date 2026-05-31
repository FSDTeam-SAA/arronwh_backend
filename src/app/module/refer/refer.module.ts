import { Module } from '@nestjs/common';
import { ReferService } from './refer.service';
import { ReferController } from './refer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Refer, ReferSchema } from './entities/refer.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Refer.name, schema: ReferSchema }]),
  ],
  controllers: [ReferController],
  providers: [ReferService],
})
export class ReferModule {}
