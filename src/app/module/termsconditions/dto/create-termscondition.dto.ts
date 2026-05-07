import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTermsconditionDto {
  @ApiPropertyOptional({
    example: 'Terms and Conditions Title',
    description: 'Title of the terms and conditions',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    example: 'Terms and Conditions Subtitle',
  })
  @IsString()
  @IsNotEmpty()
  subtitle: string;

  @ApiPropertyOptional({
    example: 'Terms and Conditions Description',
  })
  @IsString()
  @IsNotEmpty()
  description: string;
}
