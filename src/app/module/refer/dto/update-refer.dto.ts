import { PartialType } from '@nestjs/swagger';
import { CreateReferDto } from './create-refer.dto';

export class UpdateReferDto extends PartialType(CreateReferDto) {}
