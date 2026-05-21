import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AftercareService } from './aftercare.service';
import { CreateAftercareDto } from './dto/create-aftercare.dto';
import { UpdateAftercareDto } from './dto/update-aftercare.dto';

@Controller('aftercare')
export class AftercareController {
  constructor(private readonly aftercareService: AftercareService) {}

  @Post()
  create(@Body() createAftercareDto: CreateAftercareDto) {
    return this.aftercareService.create(createAftercareDto);
  }

  @Get()
  findAll() {
    return this.aftercareService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.aftercareService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAftercareDto: UpdateAftercareDto) {
    return this.aftercareService.update(+id, updateAftercareDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.aftercareService.remove(+id);
  }
}
