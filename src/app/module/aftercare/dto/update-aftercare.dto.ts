import { PartialType } from '@nestjs/swagger';
import { CreateAftercareDto } from './create-aftercare.dto';

export class UpdateAftercareDto extends PartialType(CreateAftercareDto) {}
