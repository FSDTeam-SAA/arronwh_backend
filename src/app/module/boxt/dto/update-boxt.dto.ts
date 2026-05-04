import { PartialType } from '@nestjs/swagger';
import { CreateBoxtDto } from './create-boxt.dto';

export class UpdateBoxtDto extends PartialType(CreateBoxtDto) {}
