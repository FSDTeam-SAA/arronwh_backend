import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class SendOtpDto {
  @ApiProperty({ example: '+447911123456', description: 'Phone in E.164 format' })
  @IsString()
  @IsNotEmpty()
  phone: string;
}