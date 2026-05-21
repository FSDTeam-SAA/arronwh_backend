import { Injectable } from '@nestjs/common';
import { CreateAftercareDto } from './dto/create-aftercare.dto';
import { UpdateAftercareDto } from './dto/update-aftercare.dto';

@Injectable()
export class AftercareService {
  create(createAftercareDto: CreateAftercareDto) {
    return 'This action adds a new aftercare';
  }

  findAll() {
    return `This action returns all aftercare`;
  }

  findOne(id: number) {
    return `This action returns a #${id} aftercare`;
  }

  update(id: number, updateAftercareDto: UpdateAftercareDto) {
    return `This action updates a #${id} aftercare`;
  }

  remove(id: number) {
    return `This action removes a #${id} aftercare`;
  }
}
