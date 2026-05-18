import { Module } from '@nestjs/common';
import { NewslatterService } from './newslatter.service';
import { NewslatterController } from './newslatter.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Newslatter, NewslatterSchema } from './entities/newslatter.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Newslatter.name, schema: NewslatterSchema },
    ]),
  ],
  controllers: [NewslatterController],
  providers: [NewslatterService],
})
export class NewslatterModule {}
