import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateControllerDto {
  @ApiPropertyOptional()
  title: string;

  @ApiPropertyOptional()
  description: string;

  @ApiPropertyOptional({ type: [String] })
  badges: string[];

  @ApiPropertyOptional()
  @Type(() => Number)
  price: number;

  @ApiPropertyOptional()
  @Type(() => Number)
  discount: number;

  @ApiPropertyOptional({ type: [String] })
  images: string[];
}