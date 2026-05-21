import { Controller, Get, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { PostcodeService } from './postcode.service';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';

@ApiTags('Postcode')
@Controller('postcode')
export class PostcodeController {
  constructor(private readonly postcodeService: PostcodeService) {}

  // /postcode/DN370BG/addresses
  @Get(':postcode/addresses')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get full street addresses for a UK postcode',
    description:
      'Returns house names, street, town — exactly like the dropdown image',
  })
  @ApiParam({ name: 'postcode', example: 'DN370BG' })
  async getAddresses(@Param('postcode') postcode: string) {
    const result = await this.postcodeService.getAddresses(postcode);
    return {
      message: 'Addresses fetched successfully',
      data: result,
    };
  }

  // /postcode/autocomplete/DN37
  // @Get('autocomplete/:partial')
  // @HttpCode(HttpStatus.OK)
  // @ApiOperation({
  //   summary: 'Autocomplete postcode suggestions while typing',
  // })
  // @ApiParam({ name: 'partial', example: 'DN37' })
  // async autocomplete(@Param('partial') partial: string) {
  //   const result = await this.postcodeService.autocompletePostcode(partial);
  //   return {
  //     message: 'Autocomplete results fetched successfully',
  //     data: result,
  //   };
  // }

  // /postcode/DN370BG/validate
  // @Get(':postcode/validate')
  // @HttpCode(HttpStatus.OK)
  // @ApiOperation({
  //   summary: 'Validate a UK postcode and get location info',
  // })
  // @ApiParam({ name: 'postcode', example: 'DN370BG' })
  // async validate(@Param('postcode') postcode: string) {
  //   const result = await this.postcodeService.validatePostcode(postcode);
  //   return {
  //     message: 'Postcode validated',
  //     data: result,
  //   };
  // }
}
