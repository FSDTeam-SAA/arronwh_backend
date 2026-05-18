import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
  Put,
} from '@nestjs/common';
import { IssueService } from './issue.service';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import pick from 'src/app/helpers/pick';
import AuthGuard from 'src/app/middlewares/auth.guard';

@ApiTags('issue')
@Controller('issue')
export class IssueController {
  constructor(private readonly issueService: IssueService) {}

  @Post()
  @ApiOperation({
    summary: 'create issue',
  })
  @ApiBody({
    type: CreateIssueDto,
  })
  @HttpCode(HttpStatus.CREATED)
  async createIssue(@Body() createIssueDto: CreateIssueDto) {
    const result = await this.issueService.createIssue(createIssueDto);

    return {
      message: 'Issue create successfully',
      data: result,
    };
  }

  @Get()
  @ApiOperation({
    summary: 'get all issues',
  })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @ApiQuery({
    name: 'searchTerm',
    required: false,
    type: String,
    example: '',
    description: 'Search by name, email, phone, message',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
    example: '',
    description: 'Filter by exact name',
  })
  @ApiQuery({
    name: 'email',
    required: false,
    type: String,
    example: '',
    description: 'Filter by exact email value',
  })
  @ApiQuery({
    name: 'phone',
    required: false,
    type: String,
    example: '',
    description: 'Filter by phone',
  })
  @ApiQuery({
    name: 'message',
    required: false,
    type: String,
    example: '',
    description: 'Message by status value',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Page number. Default is 1',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
    description: 'Items per page. Default is 10',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    example: 'createdAt',
    description: 'Sort field. Default is createdAt',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    example: 'desc',
    description: 'Sort order. Default is desc',
  })
  async getAllIssues(@Req() req: Request) {
    const filters = pick(req.query, [
      'searchTerm',
      'name',
      'email',
      'phone',
      'message',
    ]);
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result = await this.issueService.getAllIssues(filters, options);

    return {
      message: 'Issues retrieved successfully',
      meta: result.meta,
      data: result.data,
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'get issue by id',
  })
  async findIssue(@Param('id') id: string) {
    const result = await this.issueService.getSingleIssue(id);

    return {
      message: 'Issue retrieved successfully',
      data: result,
    };
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'update issue by id',
  })
  @ApiBearerAuth('access-token')
  @ApiBody({ type: UpdateIssueDto })
  @UseGuards(AuthGuard('admin'))
  async updateIssue(
    @Param('id') id: string,
    @Body() updateIssueDto: UpdateIssueDto,
  ) {
    const result = await this.issueService.updateIssue(id, updateIssueDto);

    return {
      message: 'Issue updated successfully',
      data: result,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'delete issue by id',
  })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  async deleteIssue(@Param('id') id: string) {
    const result = await this.issueService.deleteIssue(id);

    return {
      message: 'Issue deleted successfully',
      data: result,
    };
  }
}
