import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateControllerDto {
  @ApiPropertyOptional()
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsString()
  description: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  badges: string[];

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsNumber()
  price: number;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsNumber()
  discount: number;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  images: string[];


}
