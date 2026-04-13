// import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
// import { Type } from 'class-transformer';
// import {
//   IsArray,
//   IsEmail,
//   IsMongoId,
//   IsNumber,
//   IsOptional,
//   IsString,
//   ValidateNested,
// } from 'class-validator';

// class BookingQuizAnswerDto {
//   @ApiProperty({ example: 'What service do you need?' })
//   @IsString()
//   question: string;

//   @ApiProperty({ example: 'Full stack website development' })
//   @IsString()
//   answer: string;
// }

// class BookingOptionDto {
//   @ApiProperty({ example: 'Premium support' })
//   @IsString()
//   title: string;

//   @ApiPropertyOptional({ example: '1 month included support' })
//   @IsOptional()
//   @IsString()
//   value?: string;

//   @ApiPropertyOptional({ example: 150 })
//   @IsOptional()
//   @IsNumber()
//   price?: number;

//   @ApiPropertyOptional({ example: true })
//   @IsOptional()
//   included?: boolean;
// }

// class BookingCalendarDateDto {
//   @ApiProperty({ example: '2026-04-20' })
//   @IsString()
//   date: string;

//   @ApiPropertyOptional({ example: 'available' })
//   @IsOptional()
//   @IsString()
//   status?: string;
// }

// export class CreateBookingDto {
//   @ApiPropertyOptional({ example: '67f1234567890abcdef1234' })
//   @IsOptional()
//   @IsMongoId()
//   service?: string;

//   @ApiProperty({ example: 'Ariyan Smith' })
//   @IsString()
//   customerName: string;

//   @ApiProperty({ example: 'ariyan@example.com' })
//   @IsEmail()
//   email: string;

//   @ApiProperty({ example: '+8801700000000' })
//   @IsString()
//   phoneNumber: string;

//   @ApiPropertyOptional({ example: 'Dhaka, Bangladesh' })
//   @IsOptional()
//   @IsString()
//   address?: string;

//   @ApiPropertyOptional({ example: 'ArronWH' })
//   @IsOptional()
//   @IsString()
//   companyName?: string;

//   @ApiPropertyOptional({ example: 'Web Development' })
//   @IsOptional()
//   @IsString()
//   bookingType?: string;

//   @ApiPropertyOptional({ example: '2026-04-25' })
//   @IsOptional()
//   @IsString()
//   due?: string;

//   @ApiPropertyOptional({ example: '2026-04-15' })
//   @IsOptional()
//   @IsString()
//   date?: string;

//   @ApiPropertyOptional({
//     example: 'pending',
//     enum: ['pending', 'confirmed', 'completed', 'cancelled'],
//   })
//   @IsOptional()
//   @IsString()
//   status?: string;

//   @ApiPropertyOptional({ example: 'Admin' })
//   @IsOptional()
//   @IsString()
//   bookingBy?: string;

//   @ApiPropertyOptional({ example: 'Need delivery in 10 days' })
//   @IsOptional()
//   @IsString()
//   notes?: string;

//   @ApiPropertyOptional({
//     example: 'unpaid',
//     enum: ['unpaid', 'paid', 'refunded'],
//   })
//   @IsOptional()
//   @IsString()
//   paymentStatus?: string;

//   @ApiPropertyOptional({ example: 1200 })
//   @IsOptional()
//   @IsNumber()
//   subtotal?: number;

//   @ApiPropertyOptional({ example: 1500 })
//   @IsOptional()
//   @IsNumber()
//   total?: number;

//   @ApiPropertyOptional({ type: [BookingQuizAnswerDto] })
//   @IsOptional()
//   @IsArray()
//   @ValidateNested({ each: true })
//   @Type(() => BookingQuizAnswerDto)
//   quizAnswers?: BookingQuizAnswerDto[];

//   @ApiPropertyOptional({ type: [BookingOptionDto] })
//   @IsOptional()
//   @IsArray()
//   @ValidateNested({ each: true })
//   @Type(() => BookingOptionDto)
//   selectedOptions?: BookingOptionDto[];

//   @ApiPropertyOptional({ type: [BookingCalendarDateDto] })
//   @IsOptional()
//   @IsArray()
//   @ValidateNested({ each: true })
//   @Type(() => BookingCalendarDateDto)
//   bookingCalendar?: BookingCalendarDateDto[];
// }

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsPositive } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({ description: 'Quote ID to create booking from' })
  @IsNotEmpty()
  @IsString()
  quote: string;

  @ApiProperty({ description: 'Total price for the booking' })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  price: number;
}
