import { GetCustomersQueryDto } from '@/common/dtos/customers/get-customers-query.dto';
import { Customer } from '@/database/tenant/entities';
import { TenantService } from '@/tenants/tenant.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CustomersService {
  constructor(private readonly tenantsService: TenantService) {}

  async getCustomers(
    bookStoreId: string,
    getCustomersQueryDto: GetCustomersQueryDto,
  ) {
    const dataSource = await this.tenantsService.getTenantConnection({
      bookStoreId,
    });

    const { email, phoneNumber } = getCustomersQueryDto;

    const customerRepo = dataSource.getRepository(Customer);

    const query = customerRepo.createQueryBuilder('customer');

    if (email) {
      query.andWhere('customer.email LIKE :email', { email: `%${email}%` });
    }

    if (phoneNumber) {
      query.andWhere('customer.phoneNumber LIKE :phoneNumber', {
        phoneNumber: `%${phoneNumber}%`,
      });
    }

    return query.getMany();
  }
}
