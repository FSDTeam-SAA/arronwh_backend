import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateHeadofficeDto } from './dto/create-headoffice.dto';
import { UpdateHeadofficeDto } from './dto/update-headoffice.dto';
import { Headoffice, HeadofficeDocument } from './entities/headoffice.entity';
import { fileUpload } from 'src/app/helpers/fileUploder';

@Injectable()
export class HeadofficeService {
  constructor(
    @InjectModel(Headoffice.name)
    private readonly headofficeModel: Model<HeadofficeDocument>,
  ) {}

  async createHeadoffice(dto: CreateHeadofficeDto, file: Express.Multer.File) {
    const uploaded = await fileUpload.uploadToCloudinary(file);

    const result = await this.headofficeModel.create({
      ...dto,
      bannerImage: uploaded.url,
    });

    return result;
  }

  async findAllHeadoffices() {
    return await this.headofficeModel.find();
  }

  async findOneHeadoffice(id: string) {
    const result = await this.headofficeModel.findById(id);
    if (!result) throw new HttpException('Headoffice not found', 404);
    return result;
  }

  async updateHeadoffice(
    id: string,
    dto: UpdateHeadofficeDto,
    file?: Express.Multer.File,
  ) {
    const existing = await this.headofficeModel.findById(id);
    if (!existing) throw new HttpException('Headoffice not found', 404);

    let updateData: any = { ...dto };

    if (file) {
      // পুরনো image delete
      if ((existing as any).bannerImagePublicId) {
        await fileUpload.deleteFromCloudinary(
          (existing as any).bannerImagePublicId,
        );
      }
      const uploaded = await fileUpload.uploadToCloudinary(file);
      updateData.bannerImage = uploaded.url;
      updateData.bannerImagePublicId = uploaded.public_id;
    }

    const result = await this.headofficeModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true },
    );

    return result;
  }

  async deleteHeadoffice(id: string) {
    const existing = await this.headofficeModel.findById(id);
    if (!existing) throw new HttpException('Headoffice not found', 404);

    // cloudinary থেকে image delete
    if ((existing as any).bannerImagePublicId) {
      await fileUpload.deleteFromCloudinary(
        (existing as any).bannerImagePublicId,
      );
    }

    await this.headofficeModel.findByIdAndDelete(id);
    return existing;
  }
}
