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
import pick from 'src/app/helpers/pick';
import AuthGuard from 'src/app/middlewares/auth.guard';
import { CreateFooterManagementDto } from './dto/create-footer-management.dto';
import { UpdateFooterManagementDto } from './dto/update-footer-management.dto';
import { FooterManagementService } from './footer-management.service';

@ApiTags('footer-management')
@Controller('footer-management')
export class FooterManagementController {
  constructor(
    private readonly footerManagementService: FooterManagementService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new footer management' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.CREATED)
  async createFooterManagement(
    @Body() createFooterManagementDto: CreateFooterManagementDto,
  ) {
    const result = await this.footerManagementService.createFooterManagement(
      createFooterManagementDto,
    );
    return {
      message: 'Footer management created successfully',
      data: result,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all footer management' })
  @ApiQuery({ name: 'searchTerm', required: false, description: 'Search term' })
  @ApiQuery({ name: 'location', required: false, description: 'Location' })
  @ApiQuery({ name: 'email', required: false, description: 'Email' })
  @ApiQuery({ name: 'phone', required: false, description: 'Phone' })
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
  async findAllFooterManagement(@Req() req: Request) {
    const filters = pick(req.query, [
      'searchTerm',
      'location',
      'email',
      'phone',
    ]);
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result =
      await this.footerManagementService.findAllFooterManagement(
        filters,
        options,
      );
    return {
      message: 'Footer management fetched successfully',
      data: result.data,
      meta: result.meta,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single footer management' })
  @HttpCode(HttpStatus.OK)
  async findOneFooterManagement(@Param('id') id: string) {
    const result =
      await this.footerManagementService.findOneFooterManagement(id);
    return {
      message: 'Footer management fetched successfully',
      data: result,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a single footer management' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  async updateFooterManagement(
    @Param('id') id: string,
    @Body() updateFooterManagementDto: UpdateFooterManagementDto,
  ) {
    const result = await this.footerManagementService.updateFooterManagement(
      id,
      updateFooterManagementDto,
    );
    return {
      message: 'Footer management updated successfully',
      data: result,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a single footer management' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  async deleteFooterManagement(@Param('id') id: string) {
    const result =
      await this.footerManagementService.deleteFooterManagement(id);
    return {
      message: 'Footer management deleted successfully',
      data: result,
    };
  }
}
