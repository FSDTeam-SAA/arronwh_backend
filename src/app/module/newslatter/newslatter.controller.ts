import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
} from '@nestjs/common';
import { NewslatterService } from './newslatter.service';
import { CreateNewslatterDto } from './dto/create-newslatter.dto';
import { UpdateNewslatterDto } from './dto/update-newslatter.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import pick from 'src/app/helpers/pick';
import AuthGuard from 'src/app/middlewares/auth.guard';

@ApiTags('newslatter')
@Controller('newslatter')
export class NewslatterController {
  constructor(private readonly newslatterService: NewslatterService) {}

  @Post()
  @ApiOperation({ summary: 'Create a newslatter' })
  @HttpCode(HttpStatus.CREATED)
  async createNewslatter(@Body() createNewslatterDto: CreateNewslatterDto) {
    const result =
      await this.newslatterService.createNewslatter(createNewslatterDto);
    return {
      message: 'Newslatter created successfully',
      data: result,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Find all newslatters' })
  @ApiQuery({ name: 'email', required: false, description: 'email to search' })
  @ApiQuery({ name: 'limit', required: false, description: 'limit to fetch' })
  @ApiQuery({ name: 'page', required: false, description: 'page number' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'sort by' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'sort order' })
  @ApiQuery({ name: 'searchTerm', required: false, description: 'search term' })
  @HttpCode(HttpStatus.OK)
  async findAllNewslatters(@Req() req: Request) {
    const params = pick(req.query, ['searchTerm', 'email']);
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result = await this.newslatterService.findAllNewslatters(
      params,
      options,
    );
    return {
      message: 'Newslatter fetched successfully',
      meta: result.meta,
      data: result.data,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find one newslatter' })
  @HttpCode(HttpStatus.OK)
  async findOneNewslatter(@Param('id') id: string) {
    const result = await this.newslatterService.findOneNewslatter(id);
    return {
      message: 'Newslatter fetched successfully',
      data: result,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update one newslatter' })
  @HttpCode(HttpStatus.OK)
  async updateNewslatter(
    @Param('id') id: string,
    @Body() updateNewslatterDto: UpdateNewslatterDto,
  ) {
    const result = await this.newslatterService.updateNewslatter(
      id,
      updateNewslatterDto,
    );
    return {
      message: 'Newslatter updated successfully',
      data: result,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete one newslatter' })
  @HttpCode(HttpStatus.OK)
  async removeNewslatter(@Param('id') id: string) {
    const result = await this.newslatterService.removeNewslatter(id);
    return {
      message: 'Newslatter deleted successfully',
      data: result,
    };
  }

  @Post('broadcast')
  @ApiOperation({ summary: 'Broadcast one newslatter' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        subject: { type: 'string', example: 'Welcome to Arronwh Newsletter' },
        html: { type: 'string', example: '<h1>Welcome to Arronwh Newsletter</h1>' },
      },
    },
  })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  async broadcastNewslatter(
    @Body() payload: { subject: string; html: string },
  ) {
    const result = await this.newslatterService.broadcastNewsletter(payload);
    return {
      message: 'Newslatter broadcast successfully',
      data: result,
    };
  }
}
