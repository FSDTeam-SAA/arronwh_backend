import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CallbackMessageDto {
  @ApiProperty({ example: 'Hello subscribers, check out our new offer!' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsString()
  reason: string;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ example: 'Special offer from YOLO HEAT!' })
  @IsString()
  subject: string;
}