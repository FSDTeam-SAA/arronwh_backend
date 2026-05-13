import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ValueDataDto {
  @ApiPropertyOptional({
    description: 'Image file in binary buffer format',
    type: 'string',
    format: 'binary',
  })
  image: any;

  @ApiPropertyOptional({
    description: 'Title of the value item',
    example: 'Innovation',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: 'Description of the value item',
    example: 'We strive to innovate in everything we do.',
  })
  @IsString()
  @IsNotEmpty()
  description: string;
}

export class CreateValueDto {
  @ApiPropertyOptional({
    description: 'Title of the value',
    example: 'Core Values',
  })
  @IsString()
  @IsNotEmpty()
  valueTitle: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the value',
    example: 'These are the principles that guide our work.',
  })
  @IsString()
  @IsNotEmpty()
  valueDetail: string;
}
