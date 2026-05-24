import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import buildWhereConditions from 'src/app/helpers/buildWhereConditions';
import { fileUpload } from 'src/app/helpers/fileUploder';
import paginationHelper, { IOptions } from 'src/app/helpers/pagenation';
import { IFilterParams } from 'src/app/helpers/pick';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Review, ReviewDocument } from './entities/review.entity';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name)
    private readonly reviewModel: Model<ReviewDocument>,
  ) {}

  async createReview(
    createReviewDto: CreateReviewDto,
    video?: Express.Multer.File,
  ) {
    const data: Record<string, unknown> = { ...createReviewDto };

    if (video) {
      const uploaded = await fileUpload.uploadVideoToCloudinary(video);
      data.video = uploaded.url;
      data.videoPublicId = uploaded.public_id;
    }

    const result = await this.reviewModel.create(data);
    return result;
  }

  async getAllReviews(params: IFilterParams, options: IOptions) {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper(options);
    const searchAbleFields = ['title', 'review', 'name', 'location'];
    const whenConditation = buildWhereConditions(params, searchAbleFields);

    const result = await this.reviewModel
      .find(whenConditation)
      .sort({ [sortBy]: sortOrder } as any)
      .skip(skip)
      .limit(limit);

    const total = await this.reviewModel.countDocuments(whenConditation);

    return {
      meta: {
        page,
        limit,
        total,
      },
      data: result,
    };
  }

  async getSingleReview(id: string) {
    const result = await this.reviewModel.findById(id);
    if (!result) throw new HttpException('Review is not found', 404);
    return result;
  }

  async updateReview(
    id: string,
    updateReviewDto: UpdateReviewDto,
    video?: Express.Multer.File,
  ) {
    const review = await this.reviewModel.findById(id);
    if (!review) throw new HttpException('Review is not found', 404);
    const updateData = Object.entries(updateReviewDto).reduce(
      (acc, [key, value]) => {
        if (key === 'removeVideo') return acc;
        if (value !== undefined && value !== null && value !== '') {
          acc[key] = value;
        }
        return acc;
      },
      {} as Record<string, unknown>,
    );

    if (video) {
      const uploaded = await fileUpload.uploadVideoToCloudinary(video);
      if (!uploaded?.public_id && review.videoPublicId) {
        throw new HttpException('Video upload failed', 500);
      }
      updateData.video = uploaded.url;
      updateData.videoPublicId = uploaded.public_id;

      if (review.videoPublicId) {
        await fileUpload.deleteVideoFromCloudinary(review.videoPublicId);
      }
    } else if (updateReviewDto.removeVideo === 'true') {
      if (review.videoPublicId) {
        await fileUpload.deleteVideoFromCloudinary(review.videoPublicId);
      }
      updateData.video = '';
      updateData.videoPublicId = '';
    }

    const result = await this.reviewModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    return result;
  }

  async deleteReview(id: string) {
    const result = await this.reviewModel.findByIdAndDelete(id);
    if (!result) throw new HttpException('Review is not found', 404);

    if (result.videoPublicId) {
      await fileUpload.deleteVideoFromCloudinary(result.videoPublicId);
    }

    return result;
  }
}
