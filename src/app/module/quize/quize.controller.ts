import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { QuizeService } from './quize.service';
import { CreateQuizeDto } from './dto/create-quize.dto';
import { UpdateQuizeDto } from './dto/update-quize.dto';

@Controller('quize')
export class QuizeController {
  constructor(private readonly quizeService: QuizeService) {}

  @Post()
  create(@Body() createQuizeDto: CreateQuizeDto) {
    return this.quizeService.create(createQuizeDto);
  }

  @Get()
  findAll() {
    return this.quizeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quizeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateQuizeDto: UpdateQuizeDto) {
    return this.quizeService.update(+id, updateQuizeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.quizeService.remove(+id);
  }
}
