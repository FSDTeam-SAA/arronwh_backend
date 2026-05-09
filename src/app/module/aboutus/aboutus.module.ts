import { Module } from '@nestjs/common';
import { AboutusService } from './aboutus.service';
import { AboutusController } from './aboutus.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Aboutus, AboutusSchema } from './entities/aboutus.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Aboutus.name, schema: AboutusSchema }]),
  ],
  controllers: [AboutusController],
  providers: [AboutusService],
})
export class AboutusModule {}
