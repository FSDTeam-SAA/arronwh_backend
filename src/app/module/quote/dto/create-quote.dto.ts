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

export class PersonalInfoDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsNotEmpty()
  @IsString()
  fastName: string;

  @IsNotEmpty()
  @IsString()
  sureName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  mobleNumber: string;
}

export class PayMonthlyDataDto {
  @IsNumber()
  @Min(0, { message: 'Deposit must be greater than or equal to 0' })
  deposit: number;

  @IsNumber()
  @IsPositive({ message: 'Month number must be at least 1' })
  mounthNumber: number;

  @IsNumber()
  @IsPositive()
  amount: number;
}

export class CreateQuoteDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => PersonalInfoDto)
  personalInfo: PersonalInfoDto;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  quizes?: string[];

  @IsOptional()
  @IsMongoId()
  serviceId?: string;

  @IsOptional()
  @IsMongoId()
  controller?: string;

  @IsOptional()
  @IsMongoId()
  extra?: string;

  @IsOptional()
  @IsDateString()
  surveyData?: string;

  @IsOptional()
  @IsDateString()
  installDate?: string;

  @IsOptional()
  @IsString()
  installAddress?: string;

  @IsOptional()
  @IsBoolean()
  payByCard?: boolean;

  @IsOptional()
  @IsBoolean()
  payMounthly?: boolean;

  @ValidateIf((obj: CreateQuoteDto) => obj.payMounthly === true)
  @IsNotEmpty({
    message: 'payMounthlyData is required when payMounthly is true',
  })
  @ValidateNested()
  @Type(() => PayMonthlyDataDto)
  payMounthlyData?: PayMonthlyDataDto;
}
