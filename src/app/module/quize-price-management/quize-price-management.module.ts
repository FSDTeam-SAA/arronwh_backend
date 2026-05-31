import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuizePriceManagementController } from './quize-price-management.controller';
import { QuizePriceManagementService } from './quize-price-management.service';
import {
  QuizePriceManagement,
  QuizePriceManagementSchema,
} from './entities/quize-price-management.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: QuizePriceManagement.name,
        schema: QuizePriceManagementSchema,
      },
    ]),
  ],
  controllers: [QuizePriceManagementController],
  providers: [QuizePriceManagementService],
})
export class QuizePriceManagementModule {}
