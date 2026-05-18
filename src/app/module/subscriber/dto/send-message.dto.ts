import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({ example: 'Hello subscribers, check out our new offer!' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsString()
  attachmentUrl?: string;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsString()
  attachmentPublicId?: string;

  @ApiProperty({ example: 'Special offer from YOLO HEAT!' })
  @IsString()
  subject: string;
}