import { BookStoreId } from '@/common/decorators';
import { CustomersService } from '@/modules/customers/customers.service';
import { Controller, Get } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

@Controller('customers')
@ApiExcludeController()
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  async getCustomers(@BookStoreId() bookStoreId: string) {
    return this.customersService.getCustomers(bookStoreId);
  }
}
