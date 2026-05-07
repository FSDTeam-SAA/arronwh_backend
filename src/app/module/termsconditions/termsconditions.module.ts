import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Termscondition,
  TermsconditionSchema,
} from './entities/termscondition.entity';
import { TermsconditionsController } from './termsconditions.controller';
import { TermsconditionsService } from './termsconditions.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Termscondition.name, schema: TermsconditionSchema },
    ]),
  ],
  controllers: [TermsconditionsController],
  providers: [TermsconditionsService],
})
export class TermsconditionsModule {}
