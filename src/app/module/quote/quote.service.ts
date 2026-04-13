import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { Quote, QuoteDocument } from './entities/quote.entity';
import { Service, ServiceDocument } from '../service/entities/service.entity';
import {
  BoilerController,
  BoilerControllerDocument,
} from '../controller/entities/controller.entities';
import { Extra, ExtraDocument } from '../extra/entities/extra.entities';
import { IFilterParams } from 'src/app/helpers/pick';
import paginationHelper, { IOptions } from 'src/app/helpers/pagenation';
import buildWhereConditions from 'src/app/helpers/buildWhereConditions';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { Product, ProductDocument } from '../product/entitiy/product.entitiy';

@Injectable()
export class QuoteService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(Quote.name) private readonly quoteModel: Model<QuoteDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(BoilerController.name)
    private readonly controllerModel: Model<BoilerControllerDocument>,
    @InjectModel(Extra.name)
    private readonly extraModel: Model<ExtraDocument>,
  ) {}

  async createQuote(createQuoteDto: CreateQuoteDto) {
    const { personalInfo, productId, quizes, ...rest } = createQuoteDto as any;
    if (
      !personalInfo ||
      !personalInfo.firstName ||
      !personalInfo.surName ||
      !personalInfo.email ||
      !personalInfo.mobileNumber
    ) {
      throw new BadRequestException(
        'Personal information is required to save a quote.',
      );
    }

    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      if (productId) {
        const serviceExists = await this.productModel
          .findById(productId)
          .session(session);
        if (!serviceExists) {
          throw new BadRequestException(
            `Service with id ${productId} not found.`,
          );
        }
      }

      if (rest.controller) {
        const controllerExists = await this.controllerModel
          .findById(rest.controller)
          .session(session);
        if (!controllerExists) {
          throw new BadRequestException(
            `Controller with id ${rest.controller} not found.`,
          );
        }
      }

      if (rest.extra) {
        const extraExists = await this.extraModel
          .findById(rest.extra)
          .session(session);
        if (!extraExists) {
          throw new BadRequestException(
            `Extra with id ${rest.extra} not found.`,
          );
        }
      }

      const newQuote = new this.quoteModel({
        ...rest,
        personalInfo,
        productId: productId ?? null,
        quizes: quizes ?? [],
      });

      await newQuote.save({ session });
      await session.commitTransaction();
      return newQuote;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getAllQuotes(params: IFilterParams, options: IOptions) {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper(options);

    const whereConditions = buildWhereConditions(params, [
      'personalInfo',
      'productId',
    ]);

    const total = await this.quoteModel.countDocuments(whereConditions);
    const quotes = await this.quoteModel
      .find(whereConditions)
      .sort({ [sortBy]: sortOrder } as any)
      .skip(skip)
      .limit(limit)
      .populate('productId')
      .populate('controller')
      .populate('extra');

    return {
      data: quotes,
      total,
      page,
      limit,
    };
  }

  async getSingleQuote(id: string) {
    const quote = await this.quoteModel
      .findById(id)
      .populate('productId')
      .populate('controller')
      .populate('extra');

    if (!quote) {
      throw new BadRequestException(`Quote with id ${id} not found.`);
    }

    return quote;
  }

  async updateQuote(id: string, updateData: UpdateQuoteDto) {
    const quote = await this.quoteModel.findById(id);
    if (!quote) {
      throw new BadRequestException(`Quote with id ${id} not found.`);
    }

    if (updateData.productId) {
      const serviceExists = await this.productModel.findById(
        updateData.productId,
      );
      if (!serviceExists) {
        throw new BadRequestException(
          `Service with id ${updateData.productId} not found.`,
        );
      }
    }

    if (updateData.controller) {
      const controllerExists = await this.controllerModel.findById(
        updateData.controller,
      );
      if (!controllerExists) {
        throw new BadRequestException(
          `Controller with id ${updateData.controller} not found.`,
        );
      }
    }

    if (updateData.extra) {
      const extraExists = await this.extraModel.findById(updateData.extra);
      if (!extraExists) {
        throw new BadRequestException(
          `Extra with id ${updateData.extra} not found.`,
        );
      }
    }

    const result = await this.quoteModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    return result;
  }

  async deleteQuote(id: string) {
    const quote = await this.quoteModel.findById(id);
    if (!quote) {
      throw new BadRequestException(`Quote with id ${id} not found.`);
    }

    await this.quoteModel.findByIdAndDelete(id);
    return { message: `Quote with id ${id} has been deleted.` };
  }
}
