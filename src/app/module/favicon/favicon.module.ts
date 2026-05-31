import { Module } from '@nestjs/common';
import { FaviconService } from './favicon.service';
import { FaviconController } from './favicon.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Favicon, FaviconSchema } from './entities/favicon.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Favicon.name, schema: FaviconSchema },
    ]),
  ],
  controllers: [FaviconController],
  providers: [FaviconService],
})
export class FaviconModule {}
