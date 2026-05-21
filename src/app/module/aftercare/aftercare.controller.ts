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
import { AftercareService } from './aftercare.service';
import { CreateAftercareDto } from './dto/create-aftercare.dto';
import { UpdateAftercareDto } from './dto/update-aftercare.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import AuthGuard from 'src/app/middlewares/auth.guard';
import type { Request } from 'express';
import pick from 'src/app/helpers/pick';

@ApiTags('aftercare')
@Controller('aftercare')
export class AftercareController {
  constructor(private readonly aftercareService: AftercareService) {}

  @Post()
  @ApiOperation({ summary: 'Create aftercare' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.CREATED)
  async createAftercare(@Body() createAftercareDto: CreateAftercareDto) {
    const result =
      await this.aftercareService.createAftercare(createAftercareDto);
    return { message: 'Aftercare created successfully', data: result };
  }

  @Get()
  @ApiOperation({ summary: 'Get all aftercares with pagination and filters' })
  @ApiQuery({ name: 'searchTerm', required: false, type: String })
  @ApiQuery({ name: 'title', required: false, type: String })
  @ApiQuery({ name: 'subTitle', required: false, type: String })
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
  async findAllAftercares(@Req() req: Request) {
    const filter = pick(req.query, ['searchTerm', 'title', 'subTitle']);
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result = await this.aftercareService.findAllAftercares(
      filter,
      options,
    );
    return {
      message: 'Aftercares fetched successfully',
      meta: result.mata,
      data: result.data,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single aftercare by id' })
  @HttpCode(HttpStatus.OK)
  async findOneAftercare(@Param('id') id: string) {
    const result = await this.aftercareService.findOneAftercare(id);
    return { message: 'Aftercare fetched successfully', data: result };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update aftercare by id' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  async updateAftercare(
    @Param('id') id: string,
    @Body() updateAftercareDto: UpdateAftercareDto,
  ) {
    const result = await this.aftercareService.updateAftercare(
      id,
      updateAftercareDto,
    );
    return { message: 'Aftercare updated successfully', data: result };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete aftercare by id' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  async deleteAftercare(@Param('id') id: string) {
    const result = await this.aftercareService.deleteAftercare(id);
    return { message: 'Aftercare deleted successfully', data: result };
  }
}
