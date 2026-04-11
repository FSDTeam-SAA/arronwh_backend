import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString, IsNumber, IsOptional, IsArray,
  ValidateNested, Min, ArrayMinSize,
} from 'class-validator';

export class BoilerFeatureDto {
  @ApiProperty({ example: 'Warranty' })
  @IsString() title: string;

  @ApiProperty({ example: '10 years' })
  @IsString() value: string;
}

export class FeatureInformationDto {
  @ApiPropertyOptional() @IsOptional() @IsString() featureTitle?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() featureDescription?: string;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) featureLogo?: string[];
}

export class InstallationGuideItemDto {
  @ApiPropertyOptional() @IsOptional() @IsString() title?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() image?: string;
}

export class CreateProductDto {
  @ApiProperty() @IsString() title: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() shortDescription?: string;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) images?: string[];
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) badges?: string[];
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) price?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) discountPrice?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) payablePrice?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) monthlyPrice?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() boilerAbility?: string;
  @ApiPropertyOptional({
    type: [BoilerFeatureDto],
    example: [
      { title: 'Warranty', value: '10 years' },
      { title: 'Dimensions', value: 'W 400mm x D 310mm x H 724mm' },
    ],
  })
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => BoilerFeatureDto)
  boilerFeatures?: BoilerFeatureDto[];
  @ApiPropertyOptional({ type: FeatureInformationDto }) @IsOptional() @ValidateNested() @Type(() => FeatureInformationDto) featureInformation?: FeatureInformationDto;
  @ApiPropertyOptional() @IsOptional() @IsString() boilerIncludedData?: string;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) includedImages?: string[];
  @ApiPropertyOptional({ type: [InstallationGuideItemDto] }) @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => InstallationGuideItemDto) boilerInstallationGuide?: InstallationGuideItemDto[];
}