import { Module } from '@nestjs/common';
import { IssueService } from './issue.service';
import { IssueController } from './issue.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Issue, IssueSchema } from './entities/issue.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Issue.name, schema: IssueSchema }]),
  ],
  controllers: [IssueController],
  providers: [IssueService],
})
export class IssueModule {}
