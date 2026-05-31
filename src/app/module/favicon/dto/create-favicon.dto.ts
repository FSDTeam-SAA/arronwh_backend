import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFaviconDto {
  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  image: string;
}
