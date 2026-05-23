import { PartialType } from '@nestjs/swagger';
import { CreateSocialpartershipDto } from './create-socialpartership.dto';

export class UpdateSocialpartershipDto extends PartialType(CreateSocialpartershipDto) {}
