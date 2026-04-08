import { Module } from '@nestjs/common';
import { QuoteService } from './quote.service';
import { QuoteController } from './quote.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Quote, QuoteSchema } from './entities/quote.entity';
import { Service, ServiceSchema } from '../service/entities/service.entity';
import {
  BoilerController,
  BoilerControllerSchema,
} from '../controller/entities/controller.entities';
import { Extra, ExtraSchema } from '../extra/entities/extra.entities';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Quote.name, schema: QuoteSchema },
      { name: Service.name, schema: ServiceSchema },
      { name: BoilerController.name, schema: BoilerControllerSchema },
      { name: Extra.name, schema: ExtraSchema },
    ]),
  ],
  controllers: [QuoteController],
  providers: [QuoteService],
})
export class QuoteModule {}
