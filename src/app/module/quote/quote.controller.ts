import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  Param,
  Get,
  Put,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { QuoteService } from './quote.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import type { Request } from 'express';
import pick from 'src/app/helpers/pick';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import AuthGuard from 'src/app/middlewares/auth.guard';

@Controller('quote')
export class QuoteController {
  constructor(private readonly quoteService: QuoteService) {}

  @Post()
  @ApiOperation({
    summary: 'create quote',
  })
  @ApiBody({
    type: CreateQuoteDto,
  })
  @HttpCode(HttpStatus.CREATED)
  async createQuote(@Body() createQuoteDto: CreateQuoteDto) {
    const result = await this.quoteService.createQuote(createQuoteDto);

    return {
      message: 'create quote create successfully',
      data: result,
    };
  }

  @Get()
  @ApiOperation({
    summary: 'get all quotes',
  })
  @ApiQuery({
    name: 'searchTerm',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
  })
  @HttpCode(HttpStatus.OK)
  async getAllQuotes(@Req() req: Request) {
    const filetrs = pick(req.query, ['searchTrem']);
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result = await this.quoteService.getAllQuotes(filetrs, options);

    return {
      message: 'get all quotes successfully',
      data: result,
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'get single quote',
  })
  @HttpCode(HttpStatus.OK)
  async getSingleQuote(@Param('id') id: string) {
    const result = await this.quoteService.getSingleQuote(id);

    return {
      message: 'get single quote successfully',
      data: result,
    };
  }

  @Put(':id')
  @ApiOperation({
    summary: 'update quote',
  })
  @ApiBody({
    type: UpdateQuoteDto,
  })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  async updateQuote(
    @Param('id') id: string,
    @Body() updateData: UpdateQuoteDto,
  ) {
    const result = await this.quoteService.updateQuote(id, updateData);

    return {
      message: 'update quote successfully',
      data: result,
    };
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'delete quote',
  })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  async deleteQuote(@Param('id') id: string) {
    const result = await this.quoteService.deleteQuote(id);

    return {
      message: 'delete quote successfully',
      data: result,
    };
  }
}
