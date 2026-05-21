import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAftercareDto {
  @ApiProperty({ example: 'Post Care Tips', description: 'Title of aftercare' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Follow these steps...',
    description: 'Subtitle of aftercare',
  })
  @IsString()
  @IsNotEmpty()
  subTitle: string;
}
