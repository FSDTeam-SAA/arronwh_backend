import { Module } from '@nestjs/common';
import { SocialpartershipService } from './socialpartership.service';
import { SocialpartershipController } from './socialpartership.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Socialpartership,
  SocialpartershipSchema,
} from './entities/socialpartership.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Socialpartership.name, schema: SocialpartershipSchema },
    ]),
  ],
  controllers: [SocialpartershipController],
  providers: [SocialpartershipService],
})
export class SocialpartershipModule {}
