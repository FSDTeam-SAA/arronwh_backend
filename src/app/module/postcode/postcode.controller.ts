// // postcode.controller.ts
// import { Controller, Get, Param, HttpCode, HttpStatus } from '@nestjs/common';
// import { PostcodeService } from './postcode.service';
// import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';

// @ApiTags('Postcode')
// @Controller('postcode')
// export class PostcodeController {
//   constructor(private readonly postcodeService: PostcodeService) {}

//   // ✅ GET /postcode/DN370BG/addresses
//   // Returns full street address list exactly like the image
//   @Get(':postcode/addresses')
//   @HttpCode(HttpStatus.OK)
//   @ApiOperation({
//     summary: 'Get full street addresses for a postcode',
//     description:
//       'Returns house names, street, town, postcode — like the dropdown in the image. Requires GETADDRESS_API_KEY in .env',
//   })
//   @ApiParam({ name: 'postcode', example: 'DN370BG' })
//   async getAddresses(@Param('postcode') postcode: string) {
//     const result = await this.postcodeService.getAddresses(postcode);
//     return {
//       message: 'Addresses fetched successfully',
//       data: result,
//     };
//   }

//   // ✅ GET /postcode/autocomplete/DN37
//   // Suggest full postcodes while user types
//   @Get('autocomplete/:partial')
//   @HttpCode(HttpStatus.OK)
//   @ApiOperation({
//     summary: 'Autocomplete postcode suggestions while typing',
//     description: 'Pass partial postcode like "DN37" to get full matches',
//   })
//   @ApiParam({ name: 'partial', example: 'DN37' })
//   async autocomplete(@Param('partial') partial: string) {
//     const result = await this.postcodeService.autocompletePostcode(partial);
//     return {
//       message: 'Autocomplete results fetched successfully',
//       data: result,
//     };
//   }

//   // ✅ GET /postcode/DN370BG/validate
//   // Check if postcode is valid + get region/coordinates
//   @Get(':postcode/validate')
//   @HttpCode(HttpStatus.OK)
//   @ApiOperation({
//     summary: 'Validate a UK postcode and get location info',
//     description: 'Returns validity, region, country, lat/lng',
//   })
//   @ApiParam({ name: 'postcode', example: 'DN370BG' })
//   async validate(@Param('postcode') postcode: string) {
//     const result = await this.postcodeService.validatePostcode(postcode);
//     return {
//       message: 'Postcode validated successfully',
//       data: result,
//     };
//   }
// }

// postcode.controller.ts
import { Controller, Get, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { PostcodeService } from './postcode.service';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';

@ApiTags('Postcode')
@Controller('postcode')
export class PostcodeController {
  constructor(private readonly postcodeService: PostcodeService) {}

  // ✅ GET /postcode/DN370BG/addresses
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

  // ✅ GET /postcode/autocomplete/DN37
  @Get('autocomplete/:partial')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Autocomplete postcode suggestions while typing',
  })
  @ApiParam({ name: 'partial', example: 'DN37' })
  async autocomplete(@Param('partial') partial: string) {
    const result = await this.postcodeService.autocompletePostcode(partial);
    return {
      message: 'Autocomplete results fetched successfully',
      data: result,
    };
  }

  // ✅ GET /postcode/DN370BG/validate
  @Get(':postcode/validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Validate a UK postcode and get location info',
  })
  @ApiParam({ name: 'postcode', example: 'DN370BG' })
  async validate(@Param('postcode') postcode: string) {
    const result = await this.postcodeService.validatePostcode(postcode);
    return {
      message: 'Postcode validated',
      data: result,
    };
  }
}
