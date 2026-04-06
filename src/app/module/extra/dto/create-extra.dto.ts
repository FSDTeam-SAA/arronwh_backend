import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateExtraDto {
  @ApiPropertyOptional()
  title: string;

  @ApiPropertyOptional()
  description: string;

  @ApiPropertyOptional({ type: [String] })
  badges: string[];

  @ApiPropertyOptional()
  price: number;

  @ApiPropertyOptional()
  discount: number;

  @ApiPropertyOptional({ type: [String] })
  images: string[];
}