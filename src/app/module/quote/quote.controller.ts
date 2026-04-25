import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { QuoteService } from './quote.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { ApiBody, ApiOperation, ApiQuery } from '@nestjs/swagger';

@Controller('quote')
export class QuoteController {
  constructor(private readonly quoteService: QuoteService) {}

  @Post()
  @ApiOperation({ summary: 'Create a quote' })
  @ApiBody({ type: CreateQuoteDto })
  @HttpCode(HttpStatus.CREATED)
  async createQuote(@Body() createQuoteDto: CreateQuoteDto) {
    const result = await this.quoteService.createQuote(createQuoteDto);
    return {
      message: 'Quote created successfully',
      data: result,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all quotes' })
  @ApiQuery({ name: 'searchTerm', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @HttpCode(HttpStatus.OK)
  async getAllQuotes(
    @Query('searchTerm') searchTerm?: string,
    @Query('limit') limit?: number,
    @Query('page') page?: number,
  ) {
    const filters = searchTerm ? { searchTerm } : {};
    const options = { limit, page };
    const result = await this.quoteService.getAllQuotes(filters, options);
    return {
      message: 'Quotes fetched successfully',
      data: result,
    };
  }

  @Get('install-survey-data')
  @ApiOperation({ summary: 'Get survey and install date data for quotes' })
  @HttpCode(HttpStatus.OK)
  async getQuoteSurveyAndInstallData() {
    const result = await this.quoteService.quoteUseServeDataInstallDate();
    return {
      message: 'Quote survey and install date data fetched successfully',
      data: result,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single quote' })
  @HttpCode(HttpStatus.OK)
  async getSingleQuote(@Param('id') id: string) {
    const result = await this.quoteService.getSingleQuote(id);
    return {
      message: 'Quote fetched successfully',
      data: result,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a quote' })
  @ApiBody({ type: UpdateQuoteDto })
  @HttpCode(HttpStatus.OK)
  async updateQuote(
    @Param('id') id: string,
    @Body() updateQuoteDto: UpdateQuoteDto,
  ) {
    const result = await this.quoteService.updateQuote(id, updateQuoteDto);
    return {
      message: 'Quote updated successfully',
      data: result,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a quote' })
  @HttpCode(HttpStatus.OK)
  async deleteQuote(@Param('id') id: string) {
    const result = await this.quoteService.deleteQuote(id);
    return result;
  }

  //email functionality will be added later add by mahabur

  @Post(':id/email')
  @ApiOperation({ summary: 'Send quote via email' })
  @ApiBody({
    required: false,
    schema: {
      type: 'object',
      properties: {
        price: { type: 'number', example: 2499.99 },
        url: {
          type: 'string',
          example:
            'https://arronwh.com/boilers/system-selection/product-details?quoteId=123',
        },
      },
    },
  })
  @ApiQuery({ name: 'price', required: false, type: Number })
  @ApiQuery({ name: 'url', required: false, type: String })
  @HttpCode(HttpStatus.OK)
  async emailQuote(
    @Param('id') id: string,
    @Body('price') bodyPrice?: number | string,
    @Body('url') bodyUrl?: string,
    @Query('price') queryPrice?: string,
    @Query('url') queryUrl?: string,
  ) {
    const result = await this.quoteService.emailQuote(
      id,
      bodyPrice ?? queryPrice,
      bodyUrl ?? queryUrl,
    );
    return {
      message: 'Quote email sent successfully',
      data: result,
    };
  }
}
