import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateFooterManagementDto {
  @ApiProperty({ example: '123 High Street, London, UK' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({ example: 'support@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '+44 1234 567890' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'See what our customers say about our services.' })
  @IsString()
  @IsNotEmpty()
  reviewDescription: string;
}
