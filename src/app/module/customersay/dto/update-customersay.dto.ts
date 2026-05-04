import { PartialType } from '@nestjs/swagger';
import { CreateCustomersayDto } from './create-customersay.dto';

export class UpdateCustomersayDto extends PartialType(CreateCustomersayDto) {}
