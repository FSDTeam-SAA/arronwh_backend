import { Module } from '@nestjs/common';
import { AftercareService } from './aftercare.service';
import { AftercareController } from './aftercare.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Aftercare, AftercareSchema } from './entities/aftercare.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Aftercare.name, schema: AftercareSchema },
    ]),
  ],
  controllers: [AftercareController],
  providers: [AftercareService],
})
export class AftercareModule {}
