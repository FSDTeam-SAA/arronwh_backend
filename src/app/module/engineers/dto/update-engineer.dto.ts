import { PartialType } from '@nestjs/swagger';
import { CreateEngineerDto } from './create-engineer.dto';

export class UpdateEngineerDto extends PartialType(CreateEngineerDto) {}
