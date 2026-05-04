import { Injectable } from '@nestjs/common';
import { CreateBoxtDto } from './dto/create-boxt.dto';
import { UpdateBoxtDto } from './dto/update-boxt.dto';

@Injectable()
export class BoxtService {
  create(createBoxtDto: CreateBoxtDto) {
    return 'This action adds a new boxt';
  }

  findAll() {
    return `This action returns all boxt`;
  }

  findOne(id: number) {
    return `This action returns a #${id} boxt`;
  }

  update(id: number, updateBoxtDto: UpdateBoxtDto) {
    return `This action updates a #${id} boxt`;
  }

  remove(id: number) {
    return `This action removes a #${id} boxt`;
  }
}
