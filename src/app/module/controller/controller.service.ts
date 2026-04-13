import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateControllerDto } from './dto/create-controller.dto';
import { UpdateControllerDto } from './dto/update-controller.dto';
import { IFilterParams } from 'src/app/helpers/pick';
import paginationHelper, { IOptions } from 'src/app/helpers/pagenation';
import { fileUpload } from 'src/app/helpers/fileUploder';
import {
  BoilerController,
  BoilerControllerDocument,
} from './entities/controller.entities';

const controllerSearchableFields = ['title'];

@Injectable()
export class ControllerService {
  constructor(
    @InjectModel(BoilerController.name)
    private readonly controllerModel: Model<BoilerControllerDocument>,
  ) {}

  private parseDto(dto: any) {
    if (dto.price !== undefined) dto.price = Number(dto.price);
    if (dto.discount !== undefined) dto.discount = Number(dto.discount);
    if (dto.badges !== undefined && typeof dto.badges === 'string') {
      dto.badges = [dto.badges];
    }
    return dto;
  }

//   async create(dto: CreateControllerDto, files?: Express.Multer.File[]) {
//   const payload: any = {
//     title: dto.title,
//     description: dto.description,
//     badges:
//       typeof dto.badges === 'string'
//         ? [dto.badges]
//         : dto.badges ?? [],
//     price: Number(dto.price),
//     discount: dto.discount ? Number(dto.discount) : 0,
//     images: [],
//   };

//   if (files && files.length > 0) {
//     const uploadedUrls = await Promise.all(
//       files.map((file) =>
//         fileUpload.uploadToCloudinary(file).then((res) => res.url),
//       ),
//     );
//     payload.images = uploadedUrls;
//   }

//   const controller = await this.controllerModel.create(payload);
//   return controller;
// }
async create(body: any, files?: Express.Multer.File[]) {
  const payload: any = {
    title: body.title,
    description: body.description,
    badges:
      typeof body.badges === 'string'
        ? [body.badges]
        : body.badges ?? [],
    price: Number(body.price),
    discount: body.discount ? Number(body.discount) : 0,
    images: [],
  };

  if (files && files.length > 0) {
    const uploadedUrls = await Promise.all(
      files.map((file) =>
        fileUpload.uploadToCloudinary(file).then((res) => res.url),
      ),
    );
    payload.images = uploadedUrls;
  }

  const controller = await this.controllerModel.create(payload);
  return controller;
}

async update(id: string, body: any, files?: Express.Multer.File[]) {
  const controller = await this.controllerModel.findById(id);
  if (!controller) throw new HttpException('Controller not found', 404);

  const payload: any = {};

  if (body.title !== undefined) payload.title = body.title;
  if (body.description !== undefined) payload.description = body.description;
  if (body.price !== undefined) payload.price = Number(body.price);
  if (body.discount !== undefined) payload.discount = Number(body.discount);
  if (body.badges !== undefined) {
    payload.badges =
      typeof body.badges === 'string' ? [body.badges] : body.badges;
  }

  if (files && files.length > 0) {
    const uploadedUrls = await Promise.all(
      files.map((file) =>
        fileUpload.uploadToCloudinary(file).then((res) => res.url),
      ),
    );
    payload.images = uploadedUrls;
  }

  const updated = await this.controllerModel.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return updated;
}

  async getAll(params: IFilterParams, options: IOptions) {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper(options);
    const { searchTerm, ...filterData } = params;

    let whereConditions: any = {};

    if (searchTerm) {
      whereConditions.$or = controllerSearchableFields.map((field) => ({
        [field]: { $regex: searchTerm, $options: 'i' },
      }));
    }

    if (Object.keys(filterData).length) {
      whereConditions.$and = Object.entries(filterData).map(([key, value]) => ({
        [key]: value,
      }));
    }

    const total = await this.controllerModel.countDocuments(whereConditions);
    // console.log('Query Parameters:', { limit, page, skip, sortBy, sortOrder }, 'Search Term:', searchTerm, 'Filter Data:', filterData, 'Total:', total);

    const data = await this.controllerModel
      .find(whereConditions)
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder } as any);

    return {
      meta: { page, limit, total },
      data,
    };
  }

  async getSingle(id: string) {
    const controller = await this.controllerModel.findById(id);
    if (!controller) throw new HttpException('Controller not found', 404);
    return controller;
  }

// async update(
//   id: string,
//   dto: UpdateControllerDto,
//   files?: Express.Multer.File[],
// ) {
//   const controller = await this.controllerModel.findById(id);
//   if (!controller) throw new HttpException('Controller not found', 404);

//   const payload: any = {};

//   if (dto.title !== undefined) payload.title = dto.title;
//   if (dto.description !== undefined) payload.description = dto.description;
//   if (dto.price !== undefined) payload.price = Number(dto.price);
//   if (dto.discount !== undefined) payload.discount = Number(dto.discount);
//   if (dto.badges !== undefined) {
//     payload.badges =
//       typeof dto.badges === 'string' ? [dto.badges] : dto.badges;
//   }

//   if (files && files.length > 0) {
//     const uploadedUrls = await Promise.all(
//       files.map((file) =>
//         fileUpload.uploadToCloudinary(file).then((res) => res.url),
//       ),
//     );
//     payload.images = uploadedUrls;
//   }

//   const updated = await this.controllerModel.findByIdAndUpdate(id, payload, {
//     new: true,
//   });
//   return updated;
// }

  async delete(id: string) {
    const controller = await this.controllerModel.findById(id);
    if (!controller) throw new HttpException('Controller not found', 404);
    return this.controllerModel.findByIdAndDelete(id);
  }
}