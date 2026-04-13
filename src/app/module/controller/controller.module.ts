import { Module } from '@nestjs/common';
import { ControllerService } from './controller.service';
import { ControllerController } from './controller.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  BoilerController,
  BoilerControllerSchema,
} from './entities/controller.entities';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BoilerController.name, schema: BoilerControllerSchema },
    ]),
  ],
  controllers: [ControllerController],
  providers: [ControllerService],
})
export class ControllerModule {}
