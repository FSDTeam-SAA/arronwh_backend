import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { QuoteService } from './quote.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { ApiBody, ApiOperation, ApiQuery } from '@nestjs/swagger';

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

  @Post()
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
    const result = await this.quoteService.getAllQuotes({}, {});

    return {
      message: 'get all quotes successfully',
      data: result,
    };
  }
}
