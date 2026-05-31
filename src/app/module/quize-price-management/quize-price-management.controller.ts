import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import AuthGuard from 'src/app/middlewares/auth.guard';
import pick from 'src/app/helpers/pick';
import { CreateQuizePriceManagementDto } from './dto/create-quize-price-management.dto';
import { UpdateQuizePriceManagementDto } from './dto/update-quize-price-management.dto';
import { QuizePriceManagementService } from './quize-price-management.service';

@ApiTags('quize-price-management')
@Controller('quize-price-management')
export class QuizePriceManagementController {
  constructor(
    private readonly quizePriceManagementService: QuizePriceManagementService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new quize price management',
  })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.CREATED)
  async createQuizePriceManagement(
    @Body() createQuizePriceManagementDto: CreateQuizePriceManagementDto,
  ) {
    const result =
      await this.quizePriceManagementService.createQuizePriceManagement(
        createQuizePriceManagementDto,
      );
    return {
      message: 'Quize price management created successfully',
      data: result,
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Get all quize price management',
  })
  @ApiQuery({
    name: 'searchTerm',
    required: false,
    description: 'Search term',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    description: 'Quize price management name',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Limit',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'Sort by',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Sort order',
  })
  @HttpCode(HttpStatus.OK)
  async findAllQuizePriceManagement(@Req() req: Request) {
    const filters = pick(req.query, ['searchTerm', 'name']);
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result =
      await this.quizePriceManagementService.findAllQuizePriceManagement(
        filters,
        options,
      );
    return {
      message: 'Quize price management fetched successfully',
      data: result.data,
      meta: result.meta,
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a single quize price management',
  })
  @HttpCode(HttpStatus.OK)
  async findOneQuizePriceManagement(@Param('id') id: string) {
    const result =
      await this.quizePriceManagementService.findOneQuizePriceManagement(id);
    return {
      message: 'Quize price management fetched successfully',
      data: result,
    };
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a single quize price management',
  })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  async updateQuizePriceManagement(
    @Param('id') id: string,
    @Body() updateQuizePriceManagementDto: UpdateQuizePriceManagementDto,
  ) {
    const result =
      await this.quizePriceManagementService.updateQuizePriceManagement(
        id,
        updateQuizePriceManagementDto,
      );
    return {
      message: 'Quize price management updated successfully',
      data: result,
    };
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a single quize price management',
  })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  async deleteQuizePriceManagement(@Param('id') id: string) {
    const result =
      await this.quizePriceManagementService.deleteQuizePriceManagement(id);
    return {
      message: 'Quize price management deleted successfully',
      data: result,
    };
  }
}
