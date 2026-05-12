import {
  IsArray,
  IsDateString,
  IsEmail,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ─── Nested DTOs ──────────────────────────────────────────────────────────────

export class InvoiceLineItemDto {
  @ApiProperty({ example: 'Worcester Bosch 30kW Combi Boiler' })
  @IsString()
  label: string;

  @ApiProperty({ example: 1200 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 'A-rated energy efficient boiler' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class InvoiceCustomerInfoDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: '0800 123 4567' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: '10 Baker Street, London' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'SW1A 1AA' })
  @IsOptional()
  @IsString()
  postcode?: string;
}

// ─── Main DTO ─────────────────────────────────────────────────────────────────

export class CreateInvoiceDto {
  @ApiPropertyOptional({ description: 'Link to an existing quote' })
  @IsOptional()
  @IsMongoId()
  quoteId?: string;

  @ApiProperty({ type: InvoiceCustomerInfoDto })
  @ValidateNested()
  @Type(() => InvoiceCustomerInfoDto)
  customerInfo: InvoiceCustomerInfoDto;

  @ApiPropertyOptional({ type: [InvoiceLineItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceLineItemDto)
  boilers?: InvoiceLineItemDto[];

  @ApiPropertyOptional({ type: [InvoiceLineItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceLineItemDto)
  controllers?: InvoiceLineItemDto[];

  @ApiPropertyOptional({ type: [InvoiceLineItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceLineItemDto)
  extras?: InvoiceLineItemDto[];

  @ApiPropertyOptional({ example: 20, description: 'VAT rate as a percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  vatRate?: number;

  @ApiPropertyOptional({ example: 'pending', enum: ['pending', 'paid', 'cancelled', 'refunded'] })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: '2026-05-30' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ example: 'Thank you for choosing Yolo Heat!' })
  @IsOptional()
  @IsString()
  notes?: string;
}
