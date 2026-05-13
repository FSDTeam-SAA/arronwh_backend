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

export class InvoiceBoilerItemDto {
  @ApiProperty({ example: 'Worcester Bosch 30kW Combi Boiler' })
  @IsString()
  name: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(0)
  numberOfBoiler: number;

  @ApiProperty({ example: 1200 })
  @IsNumber()
  @Min(0)
  price: number;
}

export class InvoiceControllerItemDto {
  @ApiProperty({ example: 'Nest Learning Thermostat' })
  @IsString()
  name: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(0)
  numberOfControllers: number;

  @ApiProperty({ example: 250 })
  @IsNumber()
  @Min(0)
  price: number;
}

export class InvoiceExtraItemDto {
  @ApiProperty({ example: 'Magnetic Filter' })
  @IsString()
  name: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(0)
  numberOfExtra: number;

  @ApiProperty({ example: 80 })
  @IsNumber()
  @Min(0)
  price: number;
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
  @ApiProperty({ type: InvoiceCustomerInfoDto })
  @ValidateNested()
  @Type(() => InvoiceCustomerInfoDto)
  customerInfo: InvoiceCustomerInfoDto;

  @ApiPropertyOptional({ type: [InvoiceBoilerItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceBoilerItemDto)
  boilers?: InvoiceBoilerItemDto[];

  @ApiPropertyOptional({ type: [InvoiceControllerItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceControllerItemDto)
  controllers?: InvoiceControllerItemDto[];

  @ApiPropertyOptional({ type: [InvoiceExtraItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceExtraItemDto)
  extras?: InvoiceExtraItemDto[];

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

  @ApiPropertyOptional({ example: '2026-06-10' })
  @IsOptional()
  @IsDateString()
  deliveryDate?: string;

  @ApiPropertyOptional({ example: 'Thank you for choosing Yolo Heat!' })
  @IsOptional()
  @IsString()
  notes?: string;
}