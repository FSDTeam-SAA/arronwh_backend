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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { fileUpload } from 'src/app/helpers/fileUploder';
import pick from 'src/app/helpers/pick';
import AuthGuard from 'src/app/middlewares/auth.guard';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewService } from './review.service';

@ApiTags('review')
@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @ApiOperation({
    summary: 'create review',
  })
  @ApiBearerAuth('access-token')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateReviewDto })
  @UseGuards(AuthGuard('admin'))
  @UseInterceptors(FileInterceptor('video', fileUpload.uploadConfig))
  @HttpCode(HttpStatus.CREATED)
  async createReview(
    @Body() createReviewDto: CreateReviewDto,
    @UploadedFile() video?: Express.Multer.File,
  ) {
    const result = await this.reviewService.createReview(
      createReviewDto,
      video,
    );

    return {
      message: 'Review create successfully',
      data: result,
    };
  }

  @Get()
  @ApiOperation({
    summary: 'get all reviews',
  })
  @ApiQuery({ name: 'searchTerm', required: false, type: String })
  @ApiQuery({ name: 'title', required: false, type: String })
  @ApiQuery({ name: 'review', required: false, type: String })
  @ApiQuery({ name: 'rating', required: false, type: Number })
  @ApiQuery({ name: 'name', required: false, type: String })
  @ApiQuery({ name: 'location', required: false, type: String })
  @ApiQuery({ name: 'isVerified', required: false, type: Boolean })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @HttpCode(HttpStatus.OK)
  async getAllReviews(@Req() req: Request) {
    const filters = pick(req.query, [
      'searchTerm',
      'title',
      'review',
      'rating',
      'name',
      'location',
      'isVerified',
      'isActive',
    ]);
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result = await this.reviewService.getAllReviews(filters, options);

    return {
      message: 'Reviews retrieved successfully',
      meta: result.meta,
      data: result.data,
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'get review by id',
  })
  @HttpCode(HttpStatus.OK)
  async getSingleReview(@Param('id') id: string) {
    const result = await this.reviewService.getSingleReview(id);

    return {
      message: 'Review retrieved successfully',
      data: result,
    };
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'update review by id',
  })
  @ApiBearerAuth('access-token')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateReviewDto })
  @UseGuards(AuthGuard('admin'))
  @UseInterceptors(FileInterceptor('video', fileUpload.uploadConfig))
  @HttpCode(HttpStatus.OK)
  async updateReview(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @UploadedFile() video?: Express.Multer.File,
  ) {
    const result = await this.reviewService.updateReview(
      id,
      updateReviewDto,
      video,
    );

    return {
      message: 'Review updated successfully',
      data: result,
    };
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'delete review by id',
  })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  async deleteReview(@Param('id') id: string) {
    const result = await this.reviewService.deleteReview(id);

    return {
      message: 'Review deleted successfully',
      data: result,
    };
  }
}
