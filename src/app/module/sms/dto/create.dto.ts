import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsPhoneNumber, IsString, MaxLength } from 'class-validator';

export class SendSmsDto {
  @ApiProperty({
    example: '+447700900123',
    description: 'Recipient phone number in international format',
  })
  @IsNotEmpty()
  @IsPhoneNumber()
  to: string;

  @ApiProperty({
    example: 'Your AI raw phone messaging implemented.',
    description: 'SMS message body',
    maxLength: 1600,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1600)
  message: string;
}
