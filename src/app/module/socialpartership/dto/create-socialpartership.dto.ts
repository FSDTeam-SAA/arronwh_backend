import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSocialpartershipDto {
  @ApiProperty({ example: 'Social' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Be our friend, follow us.' })
  @IsString()
  @IsNotEmpty()
  subTitle: string;

  @ApiPropertyOptional({ example: 'hello@yoloheat.co.uk' })
  @IsOptional()
  @IsString()
  email: string;

  @ApiPropertyOptional({ example: '#000000' })
  @IsOptional()
  @IsString()
  backgroundColor: string;

  @ApiPropertyOptional({ example: '#ffffff' })
  @IsOptional()
  @IsString()
  textColor: string;
}
