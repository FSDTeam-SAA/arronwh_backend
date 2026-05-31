import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateReviewDto {
  @ApiPropertyOptional({ example: 'Amazing service' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'I had a fantastic experience with YOLO HEAT!' })
  @IsString()
  @IsOptional()
  subtitle?: string;

  @ApiPropertyOptional({
    example:
      'The quote process was simple and transparent. No hidden fees, no surprises.',
  })
  @IsString()
  @ApiProperty()
  review?: string;

  @ApiPropertyOptional({ example: 5 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;

  @ApiPropertyOptional({ example: 'Michael Brown' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Manchester, UK' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Review video file upload',
  })
  @IsOptional()
  video?: Express.Multer.File;

  @ApiPropertyOptional({ example: true })
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;

  @ApiPropertyOptional({ example: true })
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
