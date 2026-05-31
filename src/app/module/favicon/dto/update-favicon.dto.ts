import { PartialType } from '@nestjs/swagger';
import { CreateFaviconDto } from './create-favicon.dto';

export class UpdateFaviconDto extends PartialType(CreateFaviconDto) {}
