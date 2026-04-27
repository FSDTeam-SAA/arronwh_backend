// twilio/dto/make-call.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class MakeCallDto {
  @ApiProperty({ example: '+1234567890', description: 'Phone number to call' })
  @IsString()
  @IsNotEmpty()
  to: string;
}
