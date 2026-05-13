import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateFaqDto {
  @ApiProperty({ example: 'What is this service?' })
  @IsString()
  question: string;

  @ApiProperty({ example: 'This is a car checker service.' })
  @IsString()
  answer: string;

  @ApiPropertyOptional({ example: 'General' })
  @IsString()
  category: string;


}
