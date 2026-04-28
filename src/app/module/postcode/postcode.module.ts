import { Module } from '@nestjs/common';
import { PostcodeService } from './postcode.service';
import { PostcodeController } from './postcode.controller';

@Module({
  controllers: [PostcodeController],
  providers: [PostcodeService],
})
export class PostcodeModule {}
