import { Module } from '@nestjs/common';
import { PolicyService } from './policy.service';
import { PolicyController } from './policy.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Policy, PolicySchema } from './entities/policy.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Policy.name, schema: PolicySchema }]),
  ],
  controllers: [PolicyController],
  providers: [PolicyService],
})
export class PolicyModule {}
