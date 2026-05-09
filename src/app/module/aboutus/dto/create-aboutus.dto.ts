import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAboutusDto {
  @ApiPropertyOptional({
    example: 'Welcome To Our Company',
  })
  @IsString()
  @IsNotEmpty()
  headerTitle: string;

  @ApiPropertyOptional({
    example: 'We provide the best digital services for our clients.',
  })
  @IsString()
  @IsNotEmpty()
  headerDescription: string;

  @ApiPropertyOptional({
    example: 'About Us',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    example: 'Our company has been working successfully for the last 5 years.',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    description: 'Upload multiple images',
  })
  @IsOptional()
  images?: any[];
}
