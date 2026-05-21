import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreatePolicyDto {
  @ApiPropertyOptional({ example: 'Privacy Policy' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'This is the privacy policy description.' })
  @IsString()
  @IsOptional()
  description?: string;
}
