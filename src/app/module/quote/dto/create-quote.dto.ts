import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsArray,
  IsNumber,
  ValidateNested,
  IsNotEmpty,
  IsEmail,
} from 'class-validator';
import { Type } from 'class-transformer';

class PersonalInfoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  surName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  mobileNumber: string;
}

class PayMonthlyDataDto {
  @ApiProperty()
  @IsNumber()
  deposit: number;

  @ApiProperty()
  @IsNumber()
  monthNumber: number;

  @ApiProperty()
  @IsNumber()
  amount: number;
}

export class CreateQuoteDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  quizes?: string[];

  @ApiProperty({ type: PersonalInfoDto })
  @ValidateNested()
  @Type(() => PersonalInfoDto)
  personalInfo: PersonalInfoDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  serviceId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  controller?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  extra?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  surveyDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  installDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  installAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  payByCard?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  payMonthly?: boolean;

  @ApiPropertyOptional({ type: PayMonthlyDataDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PayMonthlyDataDto)
  payMonthlyData?: PayMonthlyDataDto;
}
