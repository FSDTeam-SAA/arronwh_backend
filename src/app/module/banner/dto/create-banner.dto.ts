import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateBannerDto {
  @ApiPropertyOptional({ example: 'Summer Sale' })
  @IsString()
  @IsOptional()
  firstTitle?: string;

  @ApiPropertyOptional({ example: 'Up to 50% Off' })
  @IsString()
  @IsOptional()
  secondTitle?: string;

  @ApiPropertyOptional({ example: 'Limited time offer' })
  @IsString()
  @IsOptional()
  subTitle?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['Free Shipping', '24/7 Support'],
    description: 'Array of features',
  })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => (Array.isArray(value) ? value : value?.split(',').map(s => s.trim())))
  feature?: string[];

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Banner image file',
  })
  @IsOptional()
  image: any;

  @ApiPropertyOptional({ example: 'Banner Alt Text' })
  @IsString()
  @IsOptional()
  imageText?: string;

  @ApiPropertyOptional({ example: '#ffffff' })
  @IsString()
  @IsOptional()
  backgroundColor?: string;

  @ApiPropertyOptional({ example: '#000000' })
  @IsString()
  @IsOptional()
  textColor?: string;

  @ApiPropertyOptional({ example: 'Get quote' })
  @IsString()
  @IsOptional()
  buttonText?: string;
}
