import { PartialType } from '@nestjs/swagger';
import { CreateFooterManagementDto } from './create-footer-management.dto';

export class UpdateFooterManagementDto extends PartialType(
  CreateFooterManagementDto,
) {}
