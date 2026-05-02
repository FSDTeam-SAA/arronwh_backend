import { Controller, Get, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { PostcodeService } from './postcode.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Postcode')
@Controller('postcode')
export class PostcodeController {
  constructor(private readonly postcodeService: PostcodeService) {}

  @Get(':postcode')
  @HttpCode(HttpStatus.OK)
  async getAllPostcode(@Param('postcode') postcode: string) {
    const result = await this.postcodeService.getAllPostcode(postcode);
    return {
      message: 'Postcode fetched successfully',
      data: result,
    };
  }
}
