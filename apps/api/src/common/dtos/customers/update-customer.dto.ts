import { PartialType } from '@nestjs/swagger'; // Hoặc '@nestjs/mapped-types'
import { CreateCustomerDto } from './create-customer.dto';

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) { }