import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateReferDto {
  @ApiPropertyOptional({ example: '' })
  @IsEmail()
  referred_by: string;

  @ApiPropertyOptional({ example: '' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: '' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsString()
  phone: string;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsString()
  postcode: string;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsString()
  address: string;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsString()
  message: string;
}
