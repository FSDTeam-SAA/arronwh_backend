import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class EngineerDateTimeDto {
  @ApiProperty({ example: 'Mon-Fri' })
  @IsString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ example: '8am - 6pm' })
  @IsString()
  @IsNotEmpty()
  time: string;
}

export class CreateEngineerDto {
  @ApiProperty({ example: 'Engineer Title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Engineer SubTitle' })
  @IsString()
  @IsNotEmpty()
  subTitle: string;

  @ApiProperty({ type: [EngineerDateTimeDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EngineerDateTimeDto)
  dateTime: EngineerDateTimeDto[];

  @ApiProperty({ example: '01700000000' })
  @IsString()
  @IsNotEmpty()
  phonenumber: string;

  @ApiProperty({ example: 'Description here...' })
  @IsString()
  @IsNotEmpty()
  description: string;
}
