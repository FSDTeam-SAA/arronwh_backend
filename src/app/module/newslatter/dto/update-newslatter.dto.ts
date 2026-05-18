import { PartialType } from '@nestjs/swagger';
import { CreateNewslatterDto } from './create-newslatter.dto';

export class UpdateNewslatterDto extends PartialType(CreateNewslatterDto) {}
