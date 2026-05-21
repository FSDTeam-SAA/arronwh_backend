import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateYoloheatDto {
  @ApiPropertyOptional({ type: String, format: 'binary' })
  @IsOptional()
  image?: any;

  @ApiPropertyOptional({ example: '' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: '' })
  @IsString()
  @IsOptional()
  discription?: string;
}

export class CreateHeaderDataDto {
  @ApiPropertyOptional({ example: '' })
  @IsString()
  @IsOptional()
  headerTitle?: string;

  @ApiPropertyOptional({ example: '' })
  @IsString()
  @IsOptional()
  headerDiscription?: string;
}
