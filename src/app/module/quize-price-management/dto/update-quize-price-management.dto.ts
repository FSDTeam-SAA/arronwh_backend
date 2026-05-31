import { PartialType } from '@nestjs/swagger';
import { CreateQuizePriceManagementDto } from './create-quize-price-management.dto';

export class UpdateQuizePriceManagementDto extends PartialType(
  CreateQuizePriceManagementDto,
) {}
