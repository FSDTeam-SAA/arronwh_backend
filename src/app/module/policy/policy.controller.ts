import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { PolicyService } from './policy.service';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { UpdatePolicyDto } from './dto/update-policy.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import AuthGuard from 'src/app/middlewares/auth.guard';
import type { Request } from 'express';
import pick from 'src/app/helpers/pick';

@ApiTags('policy')
@Controller('policy')
export class PolicyController {
  constructor(private readonly policyService: PolicyService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new policy' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.CREATED)
  async createPrivet(@Body() createPolicyDto: CreatePolicyDto) {
    const result = await this.policyService.createPrivet(createPolicyDto);
    return {
      message: 'Policy created successfully',
      data: result,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all policies' })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'searchTerm', required: false })
  @ApiQuery({ name: 'title', required: false })
  @ApiQuery({ name: 'description', required: false })
  @HttpCode(HttpStatus.OK)
  async findAllprivates(@Req() req: Request) {
    const filters = pick(req.query, ['searchTerm', 'title', 'description']);
    const options = pick(req.query, ['sortBy', 'sortOrder', 'page', 'limit']);
    const result = await this.policyService.findAllprivates(filters, options);

    return {
      message: 'Policies retrieved successfully',
      meta: result.meta,
      data: result.data,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a policy by ID' })
  @HttpCode(HttpStatus.OK)
  async getSinglePrivates(@Param('id') id: string) {
    const result = await this.policyService.getSinglePrivates(id);
    return {
      message: 'Policy retrieved successfully',
      data: result,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a policy by ID' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  async updatePrivates(
    @Param('id') id: string,
    @Body() updatePolicyDto: UpdatePolicyDto,
  ) {
    const result = await this.policyService.updatePrivates(id, updatePolicyDto);
    return {
      message: 'Policy updated successfully',
      data: result,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a policy by ID' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  async deletePrivates(@Param('id') id: string) {
    const result = await this.policyService.deletePrivates(id);
    return {
      message: 'Policy deleted successfully',
      data: result,
    };
  }
}
