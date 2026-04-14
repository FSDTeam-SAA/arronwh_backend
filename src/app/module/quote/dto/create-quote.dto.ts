import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateIf,
  ValidateNested,
  Min,
} from 'class-validator';

import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PersonalInfoDto {
  @ApiPropertyOptional({ example: 'Mr' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 'John' })
  @IsNotEmpty()
  @IsString()
  fastName: string;

  @ApiProperty({ example: 'Doe' })
  @IsNotEmpty()
  @IsString()
  sureName: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+8801XXXXXXXXX' })
  @IsNotEmpty()
  @IsString()
  mobleNumber: string;

  @ApiProperty({ example: '12345' })
  @IsNotEmpty()
  @IsString()
  postcode: string;
}

export class QuoteQuizAnswerDto {
  @ApiProperty({ example: 'What is your requirement?' })
  @IsString()
  question: string;

  @ApiProperty({ example: 'Need boiler installation' })
  @IsString()
  answer: string;
}

export class PayMounthlyDataDto {
  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(0)
  deposit: number;

  @ApiProperty({ example: 12 })
  @IsNumber()
  @IsPositive()
  mounthNumber: number;

  @ApiProperty({ example: 50 })
  @IsNumber()
  @IsPositive()
  amount: number;
}

export class CreateQuoteDto {
  @ApiProperty({ type: PersonalInfoDto })
  @ValidateNested()
  @Type(() => PersonalInfoDto)
  personalInfo: PersonalInfoDto;

  @ApiPropertyOptional({
    type: [QuoteQuizAnswerDto],
    description: 'List of quiz answers',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuoteQuizAnswerDto)
  quizAnswers?: QuoteQuizAnswerDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  productId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  controller?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  extra?: string;

  @ApiPropertyOptional({ example: '2026-04-12' })
  @IsOptional()
  @IsDateString()
  surveyDate?: string;

  @ApiPropertyOptional({ example: '2026-04-20' })
  @IsOptional()
  @IsDateString()
  installDate?: string;

  @ApiPropertyOptional({ example: 'Dhaka, Bangladesh' })
  @IsOptional()
  @IsString()
  installAddress?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  payByCard?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  payMounthly?: boolean;

  @ApiPropertyOptional({ type: PayMounthlyDataDto })
  @ValidateIf((o) => o.payMounthly === true)
  @IsOptional()
  @ValidateNested()
  @Type(() => PayMounthlyDataDto)
  payMounthlyData?: PayMounthlyDataDto;
}
