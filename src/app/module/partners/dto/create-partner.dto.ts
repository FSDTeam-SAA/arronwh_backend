import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreatePartnerDto {
  @ApiPropertyOptional({ example: 'Trust by many' })
  @IsString()
  @IsOptional()
  excellent?: string;

  @ApiPropertyOptional({ example: 'Our Partners' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: 'Upload partner images',
  })
  @IsOptional()
  images?: any[];
}
