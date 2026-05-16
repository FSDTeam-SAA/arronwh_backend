import { HttpException, Injectable } from '@nestjs/common';
import { CreateLogoDto } from './dto/create-logo.dto';
import { UpdateLogoDto } from './dto/update-logo.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Logo, LogoDocument } from './entities/logo.entity';
import { fileUpload } from 'src/app/helpers/fileUploder';
import paginationHelper, { IOptions } from 'src/app/helpers/pagenation';

@Injectable()
export class LogoService {
  constructor(
    @InjectModel(Logo.name) private readonly logoModel: Model<LogoDocument>,
  ) {}

  async createLogo(createLogoDto: CreateLogoDto, file?: Express.Multer.File) {
    if (file) {
      const { url } = await fileUpload.uploadToCloudinary(file);
      createLogoDto.image = url;
    }

    const logo = await this.logoModel.create(createLogoDto);
    return logo;
  }

  async findAllLogo(options: IOptions) {
    const { limit, skip, page, sortBy, sortOrder } = paginationHelper(options);

    const logos = await this.logoModel
      .find()
      .skip(skip)
      .limit(limit)
      .sort({
        [sortBy]: sortOrder,
      } as any);
    const total = await this.logoModel.countDocuments();
    return {
      data: logos,
      meta: {
        total,
        page,
        limit,
      },
    };
  }

  async findOneLogo(id: string) {
    const logo = await this.logoModel.findById(id);
    if (!logo) {
      throw new HttpException('Logo not found', 404);
    }
    return logo;
  }

  async updateLogo(
    id: string,
    updateLogoDto: UpdateLogoDto,
    file?: Express.Multer.File,
  ) {
    const existLogo = await this.logoModel.findById(id);
    if (!existLogo) {
      throw new HttpException('Logo not found', 404);
    }
    if (file) {
      const { url } = await fileUpload.uploadToCloudinary(file);
      updateLogoDto.image = url;
    }
    const updateData = Object.entries(updateLogoDto).reduce(
      (acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          acc[key] = value;
        }
        return acc;
      },
      {},
    );
    const logo = await this.logoModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    return logo;
  }

  async removeLogo(id: string) {
    const existLogo = await this.logoModel.findById(id);
    if (!existLogo) {
      throw new HttpException('Logo not found', 404);
    }
    await fileUpload.deleteFromCloudinary(existLogo.image);
    const logo = await this.logoModel.findByIdAndDelete(id);
    return logo;
  }
}
