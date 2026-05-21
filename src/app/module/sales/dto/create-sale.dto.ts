import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class SaleDateTimeDto {
  @IsString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  time: string;
}

export class CreateSaleDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  subTitle: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleDateTimeDto)
  dateTime: SaleDateTimeDto[];

  @IsString()
  @IsNotEmpty()
  phonenumber: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}
