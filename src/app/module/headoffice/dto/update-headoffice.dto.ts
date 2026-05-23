import { PartialType } from '@nestjs/swagger';
import { CreateHeadofficeDto } from './create-headoffice.dto';

export class UpdateHeadofficeDto extends PartialType(CreateHeadofficeDto) {}
