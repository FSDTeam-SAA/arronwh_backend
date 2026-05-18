import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateNewslatterDto {
  @ApiProperty({ example: 'newslatter@gmail.com' })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
