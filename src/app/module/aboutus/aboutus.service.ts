import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAboutusDto } from './dto/create-aboutus.dto';
import { UpdateAboutusDto } from './dto/update-aboutus.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Aboutus, AboutusDocument } from './entities/aboutus.entity';
import { Model } from 'mongoose';
import { fileUpload } from 'src/app/helpers/fileUploder';
import { IFilterParams } from 'src/app/helpers/pick';
import paginationHelper, { IOptions } from 'src/app/helpers/pagenation';
import buildWhereConditions from 'src/app/helpers/buildWhereConditions';

@Injectable()
export class AboutusService {
  constructor(
    @InjectModel(Aboutus.name)
    private readonly aboutModel: Model<AboutusDocument>,
  ) {}

  // ✅ CREATE
  async createAbout(
    createAboutusDto: CreateAboutusDto,
    files?: Express.Multer.File[],
  ) {
    let uploadedImages: string[] = [];

    if (files && files.length > 0) {
      const results = await Promise.all(
        files.map((file) => fileUpload.uploadToCloudinary(file)),
      );

      uploadedImages = results.map((img) => img.url);
    }

    const createdData = await this.aboutModel.create({
      ...createAboutusDto,
      images: uploadedImages,
    });

    return {
      success: true,
      message: 'About us created successfully',
      data: createdData,
    };
  }

  async findAll(params: IFilterParams, options: IOptions) {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper(options);
    const whereConditions = buildWhereConditions(params, [
      'headerTitle',
      'headerDescription',
      'title',
      'description',
    ]);
    const result = await this.aboutModel
      .find(whereConditions)
      .limit(limit)
      .skip(skip)
      .sort({ [sortBy]: sortOrder } as any);

    const total = await this.aboutModel.countDocuments(whereConditions);
    return {
      data: result,
      meta: {
        limit,
        page,
        total,
      },
    };
  }

  async findOne(id: string) {
    const data = await this.aboutModel.findById(id);

    if (!data) {
      throw new NotFoundException('About us not found');
    }

    return {
      success: true,
      data,
    };
  }

  async update(id: string, updateAboutusDto: UpdateAboutusDto, files: Express.Multer.File[] | undefined) {
    const updated = await this.aboutModel.findByIdAndUpdate(
      id,
      updateAboutusDto,
      { new: true },
    );

    if (!updated) {
      throw new NotFoundException('About us not found');
    }

    return {
      success: true,
      message: 'Updated successfully',
      data: updated,
    };
  }

  async remove(id: string) {
    const deleted = await this.aboutModel.findByIdAndDelete(id);

    if (!deleted) {
      throw new NotFoundException('About us not found');
    }

    return {
      success: true,
      message: 'Deleted successfully',
    };
  }
}
