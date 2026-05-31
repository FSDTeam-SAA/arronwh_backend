import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class QuizePriceValueDto {
  @ApiProperty({
    example: 'Utility room',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: '+£1,300',
  })
  @IsString()
  @IsNotEmpty()
  value: string;
}

export class CreateQuizePriceManagementDto {
  @ApiPropertyOptional({
    example: 'Where do you want your new boiler?',
  })
  @IsString()
  @IsOptional()
  name: string;

  @ApiPropertyOptional({
    type: [QuizePriceValueDto],
    example: [
      { name: 'Utility room', value: '+£1,300' },
      { name: 'Kitchen', value: '+£1,300' },
      { name: 'Garage', value: '+£1,300' },
      { name: 'Bathroom', value: '+£1,300' },
      { name: 'Bedroom', value: '+£1,300' },
      { name: 'Loft or attic', value: '+£1,500' },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizePriceValueDto)
  value: QuizePriceValueDto[];
}
