import { Module } from '@nestjs/common';
import { ExtraService } from './extra.service';
import { ExtraController } from './extra.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Extra, ExtraSchema } from './entities/extra.entities';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Extra.name, schema: ExtraSchema },
    ]),
  ],
  controllers: [ExtraController],
  providers: [ExtraService],
})
export class ExtraModule {}