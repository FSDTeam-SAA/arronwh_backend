import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateSocialpartershipDto } from './dto/create-socialpartership.dto';
import { UpdateSocialpartershipDto } from './dto/update-socialpartership.dto';
import {
  Socialpartership,
  SocialpartershipDocument,
} from './entities/socialpartership.entity';
import { fileUpload } from 'src/app/helpers/fileUploder';


@Injectable()
export class SocialpartershipService {
  constructor(
    @InjectModel(Socialpartership.name)
    private readonly socialpartershipModel: Model<SocialpartershipDocument>,
  ) {}

  async createSocialpartership(dto: CreateSocialpartershipDto) {
    const result = await this.socialpartershipModel.create(dto);
    return result;
  }

  async addSocialLink(id: string, file: Express.Multer.File, link: string) {
    const existing = await this.socialpartershipModel.findById(id);
    if (!existing) throw new HttpException('Socialpartership not found', 404);

    const uploaded = await fileUpload.uploadToCloudinary(file);

    const result = await this.socialpartershipModel.findByIdAndUpdate(
      id,
      {
        $push: {
          socialLink: {
            icon: uploaded.url,
            iconPublicId: uploaded.public_id,
            link,
          },
        },
      },
      { new: true },
    );

    return result;
  }

  async removeSocialLink(id: string, linkIndex: number) {
    const existing = await this.socialpartershipModel.findById(id);
    if (!existing) throw new HttpException('Socialpartership not found', 404);

    const socialLink = existing.socialLink as any[];
    if (!socialLink[linkIndex])
      throw new HttpException('Social link not found', 404);

    // cloudinary থেকে icon delete
    if (socialLink[linkIndex].iconPublicId) {
      await fileUpload.deleteFromCloudinary(socialLink[linkIndex].iconPublicId);
    }

    socialLink.splice(linkIndex, 1);
    existing.socialLink = socialLink as any;
    await existing.save();

    return existing;
  }

  async findAllSocialparterships() {
    return await this.socialpartershipModel.find();
  }

  async findOneSocialpartership(id: string) {
    const result = await this.socialpartershipModel.findById(id);
    if (!result) throw new HttpException('Socialpartership not found', 404);
    return result;
  }

  async updateSocialpartership(id: string, dto: UpdateSocialpartershipDto) {
    const result = await this.socialpartershipModel.findByIdAndUpdate(id, dto, {
      new: true,
    });
    if (!result) throw new HttpException('Socialpartership not found', 404);
    return result;
  }

  async deleteSocialpartership(id: string) {
    const existing = await this.socialpartershipModel.findById(id);
    if (!existing) throw new HttpException('Socialpartership not found', 404);

    // সব icon cloudinary থেকে delete
    const socialLink = existing.socialLink as any[];
    for (const sl of socialLink) {
      if (sl.iconPublicId) {
        await fileUpload.deleteFromCloudinary(sl.iconPublicId);
      }
    }

    await this.socialpartershipModel.findByIdAndDelete(id);
    return existing;
  }
}
