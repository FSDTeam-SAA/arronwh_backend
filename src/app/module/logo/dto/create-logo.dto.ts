import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLogoDto {
  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  image: string;
}
