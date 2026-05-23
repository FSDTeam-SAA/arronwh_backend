import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateHeadofficeDto {
  @ApiProperty({ example: 'Our Head Office' })
  @IsString()
  @IsNotEmpty()
  header: string;

  @ApiProperty({ example: 'We are located at...' })
  @IsString()
  @IsNotEmpty()
  description: string;
}
