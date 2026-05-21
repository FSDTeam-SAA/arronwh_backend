import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateCustomersayDto {
  @ApiPropertyOptional({ example: 'Great Service' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'The process was smooth and transparent.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'Best decision we made. Five stars!' })
  @IsString()
  review: string;

  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ example: 'Emma Davis' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Birmingham, UK' })
  @IsString()
  location: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
