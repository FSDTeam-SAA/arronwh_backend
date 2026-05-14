import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsString } from 'class-validator';

export class ManuallaySendEmailDto {
  @ApiProperty({ example: '65f1d6c5f1f1f1f1f1f1f1f1' })
  @IsMongoId()
  quoteId: string;

  @ApiProperty({
    example:
      'Thanks for requesting a YOLO HEAT quote. Please review your selected package below.',
  })
  @IsString()
  description: string;
}
