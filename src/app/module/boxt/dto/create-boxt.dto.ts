import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateBoxtDto {
  @ApiPropertyOptional({ example: 'Boxt Title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'Boxt Description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Boxt image file',
  })
  @IsOptional()
  image?: any;

  @ApiPropertyOptional({ example: 'Boxt Background Color' })
  @IsString()
  @IsOptional()
  backgroundcolor?: string;

  @ApiPropertyOptional({ example: 'Boxt Text Color' })
  @IsString()
  @IsOptional()
  textcolor?: string;
}
