import { Module } from '@nestjs/common';
import { AftercareService } from './aftercare.service';
import { AftercareController } from './aftercare.controller';

@Module({
  controllers: [AftercareController],
  providers: [AftercareService],
})
export class AftercareModule {}
