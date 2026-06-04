import { IsObject, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateEmailTemplateDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  subject?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  html?: string;

  @IsOptional()
  @IsObject()
  grapesJsProject?: Record<string, unknown>;
}
