import { PartialType } from '@nestjs/swagger';
import { CreateYoloheatDto, CreateHeaderDataDto } from './create-yoloheat.dto';

export class UpdateYoloheatDto extends PartialType(CreateYoloheatDto) {}

export class UpdateHeaderDataDto extends PartialType(CreateHeaderDataDto) {}
