import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';
import { Engineer, EngineerSchema } from './entities/engineer.entity';
import { EngineerController } from './engineers.controller';
import { EngineerService } from './engineers.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Engineer.name, schema: EngineerSchema },
    ]),
  ],
  controllers: [EngineerController],
  providers: [EngineerService],
})
export class EngineerModule {}
