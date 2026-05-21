import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

const emptyStringToUndefined = ({ value }: { value: unknown }) =>
  value === '' ? undefined : value;

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

  @ApiPropertyOptional({
    example: 'Boiler Customer',
    description:
      'Send only to customers with this tag. Leave empty to send all.',
  })
  @IsOptional()
  @Transform(emptyStringToUndefined)
  @IsString()
  tag?: string;
}
