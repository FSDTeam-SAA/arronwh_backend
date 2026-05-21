import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  Put,
} from '@nestjs/common';

import { CreateEngineerDto } from './dto/create-engineer.dto';
import { UpdateEngineerDto } from './dto/update-engineer.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import AuthGuard from 'src/app/middlewares/auth.guard';
import type { Request } from 'express';
import pick from 'src/app/helpers/pick';
import { EngineerService } from './engineers.service';

@ApiTags('engineer')
@Controller('engineer')
export class EngineerController {
  constructor(private readonly engineerService: EngineerService) {}

  @Post()
  @ApiOperation({ summary: 'Create engineer' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.CREATED)
  async createEngineer(@Body() createEngineerDto: CreateEngineerDto) {
    const result = await this.engineerService.createEngineer(createEngineerDto);
    return { message: 'Engineer created successfully', data: result };
  }

  @Get()
  @ApiOperation({ summary: 'Get all engineers with pagination and filters' })
  @ApiQuery({ name: 'searchTerm', required: false, type: String })
  @ApiQuery({ name: 'title', required: false, type: String })
  @ApiQuery({ name: 'subTitle', required: false, type: String })
  @ApiQuery({ name: 'phonenumber', required: false, type: String })
  @ApiQuery({ name: 'description', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    example: 'createdAt',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    example: 'desc',
  })
  @HttpCode(HttpStatus.OK)
  async findAllEngineers(@Req() req: Request) {
    const filter = pick(req.query, [
      'searchTerm',
      'title',
      'subTitle',
      'phonenumber',
      'description',
    ]);
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result = await this.engineerService.findAllEngineers(filter, options);
    return {
      message: 'Engineers fetched successfully',
      meta: result.mata,
      data: result.data,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single engineer by id' })
  @HttpCode(HttpStatus.OK)
  async findOneEngineer(@Param('id') id: string) {
    const result = await this.engineerService.findOneEngineer(id);
    return { message: 'Engineer fetched successfully', data: result };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update engineer by id' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  async updateEngineer(
    @Param('id') id: string,
    @Body() updateEngineerDto: UpdateEngineerDto,
  ) {
    const result = await this.engineerService.updateEngineer(
      id,
      updateEngineerDto,
    );
    return { message: 'Engineer updated successfully', data: result };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete engineer by id' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  async deleteEngineer(@Param('id') id: string) {
    const result = await this.engineerService.deleteEngineer(id);
    return { message: 'Engineer deleted successfully', data: result };
  }
}
