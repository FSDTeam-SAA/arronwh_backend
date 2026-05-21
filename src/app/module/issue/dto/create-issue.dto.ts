import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateIssueDto {
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
  message: string;
}
