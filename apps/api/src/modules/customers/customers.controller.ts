import { BookStoreId } from '@/common/decorators';
import { GetCustomersQueryDto } from '@/common/dtos/customers/get-customers-query.dto';
import { CustomersService } from '@/modules/customers/customers.service';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

@Controller('customers')
@ApiExcludeController()
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  async getCustomers(
    @BookStoreId() bookStoreId: string,
    @Query() getCustomersQueryDto: GetCustomersQueryDto,
  ) {
    return this.customersService.getCustomers(
      bookStoreId,
      getCustomersQueryDto,
    );
  }
}
