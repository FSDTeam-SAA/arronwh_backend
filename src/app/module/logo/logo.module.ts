import { Module } from '@nestjs/common';
import { LogoService } from './logo.service';
import { LogoController } from './logo.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Logo, LogoSchema } from './entities/logo.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Logo.name, schema: LogoSchema }]),
  ],
  controllers: [LogoController],
  providers: [LogoService],
})
export class LogoModule {}
