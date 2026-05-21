import { PartialType } from '@nestjs/swagger';
import { CreateTermsconditionDto } from './create-termscondition.dto';

export class UpdateTermsconditionDto extends PartialType(CreateTermsconditionDto) {}
