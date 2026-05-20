import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateSubscriberDto {
  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsString()
  attachmentUrl?: string;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsString()
  attachmentPublicId?: string;

  @ApiPropertyOptional({ example: 'Hello subscribers!' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({ enum: ['active', 'unsubscribed'] })
  @IsOptional()
  @IsEnum(['active', 'unsubscribed'])
  status?: string;

  @ApiPropertyOptional({ example: 'Boiler Customer' })
  @IsOptional()
  @IsString()
  tag?: string;
}