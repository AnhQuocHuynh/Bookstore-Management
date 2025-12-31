import { Customer } from '@/database/tenant/entities';
import { TenantService } from '@/tenants/tenant.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CustomersService {
  constructor(private readonly tenantsService: TenantService) {}

  async getCustomers(bookStoreId: string) {
    const dataSource = await this.tenantsService.getTenantConnection({
      bookStoreId,
    });

    const customerRepo = dataSource.getRepository(Customer);

    return customerRepo.find();
  }
}
