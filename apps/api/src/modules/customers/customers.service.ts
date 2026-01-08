import { CreateCustomerDto } from '@/common/dtos/customers/create-customer.dto';
import { GetCustomersQueryDto } from '@/common/dtos/customers/get-customers-query.dto';
import { generateCustomerCode } from '@/common/utils';
import { Customer } from '@/database/tenant/entities';
import { TenantService } from '@/tenants/tenant.service';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

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

  async createCustomer(
    createCustomerDto: CreateCustomerDto,
    bookStoreId: string,
  ) {
    const dataSource = await this.tenantsService.getTenantConnection({
      bookStoreId,
    });

    const customerRepo = dataSource.getRepository(Customer);

    const { fullName } = createCustomerDto;

    const newCustomer = customerRepo.create({
      ...createCustomerDto,
      customerCode: await this.generateUniqueCustomerCode(
        fullName,
        customerRepo,
      ),
    });

    return customerRepo.save(newCustomer);
  }

  private async generateUniqueCustomerCode(
    fullName: string,
    repo: Repository<Customer>,
  ) {
    let code: string;
    let exists = true;

    do {
      code = generateCustomerCode(fullName);
      const customer = await repo.findOne({ where: { customerCode: code } });
      exists = !!customer;
    } while (exists);

    return code;
  }
}
