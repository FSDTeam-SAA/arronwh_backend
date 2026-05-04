import { PartialType } from '@nestjs/swagger';
import { CreateYoloheatDto } from './create-yoloheat.dto';

export class UpdateYoloheatDto extends PartialType(CreateYoloheatDto) {}
