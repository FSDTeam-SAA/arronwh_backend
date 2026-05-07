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
import { TermsconditionsService } from './termsconditions.service';
import { CreateTermsconditionDto } from './dto/create-termscondition.dto';
import { UpdateTermsconditionDto } from './dto/update-termscondition.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import AuthGuard from 'src/app/middlewares/auth.guard';
import type { Request } from 'express';
import pick from 'src/app/helpers/pick';

@ApiTags('terms-conditions')
@Controller('termsconditions')
export class TermsconditionsController {
  constructor(
    private readonly termsconditionsService: TermsconditionsService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new terms and condition',
  })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.CREATED)
  async createTerms(@Body() createTermsconditionDto: CreateTermsconditionDto) {
    const terms = await this.termsconditionsService.createTerms(
      createTermsconditionDto,
    );
    return {
      message: 'Terms and conditions created successfully',
      data: terms,
    };
  }

  @Get()
  async getAllTerms(@Req() req: Request) {
    const filters = pick(req.query, ['title', 'subtitle', 'description']);
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const terms = await this.termsconditionsService.getAllTerms(
      filters,
      options,
    );
    return {
      message: 'Terms and conditions retrieved successfully',
      meta: terms.meta,
      data: terms.data,
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a single terms and condition',
  })
  @HttpCode(HttpStatus.OK)
  async getSingleTerms(@Param('id') id: string) {
    const terms = await this.termsconditionsService.getSingleTerms(id);
    return {
      message: 'Terms and conditions retrieved successfully',
      data: terms,
    };
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a terms and condition',
  })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  async updateTerms(
    @Param('id') id: string,
    @Body() updateTermsconditionDto: UpdateTermsconditionDto,
  ) {
    const terms = await this.termsconditionsService.updateTerms(
      id,
      updateTermsconditionDto,
    );
    return {
      message: 'Terms and conditions updated successfully',
      data: terms,
    };
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a terms and condition',
  })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  async removeTerms(@Param('id') id: string) {
    const terms = await this.termsconditionsService.removeTerms(id);
    return {
      message: 'Terms and conditions deleted successfully',
      data: terms,
    };
  }
}
