import { PartialType } from '@nestjs/swagger';
import { CreateValueDto, ValueDataDto } from './create-value.dto';

export class UpdateValueDto extends PartialType(CreateValueDto) {}
export class UpdateValueDataDto extends PartialType(ValueDataDto) {}
