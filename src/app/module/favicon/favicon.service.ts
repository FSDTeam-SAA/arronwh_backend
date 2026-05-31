import { HttpException, Injectable } from '@nestjs/common';
import { CreateFaviconDto } from './dto/create-favicon.dto';
import { UpdateFaviconDto } from './dto/update-favicon.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Favicon, FaviconDocument } from './entities/favicon.entity';
import { fileUpload } from 'src/app/helpers/fileUploder';
import paginationHelper, { IOptions } from 'src/app/helpers/pagenation';

@Injectable()
export class FaviconService {
  constructor(
    @InjectModel(Favicon.name)
    private readonly faviconModel: Model<FaviconDocument>,
  ) {}

  async createFavicon(
    createFaviconDto: CreateFaviconDto,
    file?: Express.Multer.File,
  ) {
    if (file) {
      const { url } = await fileUpload.uploadToCloudinary(file);
      createFaviconDto.image = url;
    }

    const favicon = await this.faviconModel.create(createFaviconDto);
    return favicon;
  }

  async findAllFavicon(options: IOptions) {
    const { limit, skip, page, sortBy, sortOrder } = paginationHelper(options);

    const favicons = await this.faviconModel
      .find()
      .skip(skip)
      .limit(limit)
      .sort({
        [sortBy]: sortOrder,
      } as any);
    const total = await this.faviconModel.countDocuments();
    return {
      data: favicons,
      meta: {
        total,
        page,
        limit,
      },
    };
  }

  async findOneFavicon(id: string) {
    const favicon = await this.faviconModel.findById(id);
    if (!favicon) {
      throw new HttpException('Favicon not found', 404);
    }
    return favicon;
  }

  async updateFavicon(
    id: string,
    updateFaviconDto: UpdateFaviconDto,
    file?: Express.Multer.File,
  ) {
    const existFavicon = await this.faviconModel.findById(id);
    if (!existFavicon) {
      throw new HttpException('Favicon not found', 404);
    }
    if (file) {
      const { url } = await fileUpload.uploadToCloudinary(file);
      updateFaviconDto.image = url;
    }
    const updateData = Object.entries(updateFaviconDto).reduce(
      (acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          acc[key] = value;
        }
        return acc;
      },
      {},
    );
    const favicon = await this.faviconModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    return favicon;
  }

  async removeFavicon(id: string) {
    const existFavicon = await this.faviconModel.findById(id);
    if (!existFavicon) {
      throw new HttpException('Favicon not found', 404);
    }
    await fileUpload.deleteFromCloudinary(existFavicon.image);
    const favicon = await this.faviconModel.findByIdAndDelete(id);
    return favicon;
  }
}
