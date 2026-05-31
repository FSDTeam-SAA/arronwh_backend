import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FooterManagementController } from './footer-management.controller';
import { FooterManagementService } from './footer-management.service';
import {
  FooterManagement,
  FooterManagementSchema,
} from './entities/footer-management.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FooterManagement.name, schema: FooterManagementSchema },
    ]),
  ],
  controllers: [FooterManagementController],
  providers: [FooterManagementService],
})
export class FooterManagementModule {}
