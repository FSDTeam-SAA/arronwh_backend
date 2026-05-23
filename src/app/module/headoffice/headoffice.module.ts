import { Module } from '@nestjs/common';
import { HeadofficeService } from './headoffice.service';
import { HeadofficeController } from './headoffice.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Headoffice, HeadofficeSchema } from './entities/headoffice.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Headoffice.name, schema: HeadofficeSchema },
    ]),
  ],
  controllers: [HeadofficeController],
  providers: [HeadofficeService],
})
export class HeadofficeModule {}
