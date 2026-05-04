import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BoxtService } from './boxt.service';
import { CreateBoxtDto } from './dto/create-boxt.dto';
import { UpdateBoxtDto } from './dto/update-boxt.dto';

@Controller('boxt')
export class BoxtController {
  constructor(private readonly boxtService: BoxtService) {}

  @Post()
  create(@Body() createBoxtDto: CreateBoxtDto) {
    return this.boxtService.create(createBoxtDto);
  }

  @Get()
  findAll() {
    return this.boxtService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.boxtService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBoxtDto: UpdateBoxtDto) {
    return this.boxtService.update(+id, updateBoxtDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.boxtService.remove(+id);
  }
}
