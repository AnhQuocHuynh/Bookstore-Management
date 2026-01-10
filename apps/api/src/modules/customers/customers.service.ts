import { CreateCustomerDto } from '@/common/dtos/customers/create-customer.dto';
import { GetCustomersQueryDto } from '@/common/dtos/customers/get-customers-query.dto';
import { generateCustomerCode } from '@/common/utils';
import { Customer } from '@/database/tenant/entities';
import { TenantService } from '@/tenants/tenant.service';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UpdateCustomerDto } from '@/common/dtos/customers/update-customer.dto';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { assignDefined } from '@/common/utils';

@Injectable()
export class CustomersService {
  constructor(private readonly tenantsService: TenantService) { }

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

  // 1. Hàm cập nhật khách hàng
  async updateCustomer(
    id: string,
    updateCustomerDto: UpdateCustomerDto,
    bookStoreId: string
  ) {
    const dataSource = await this.tenantsService.getTenantConnection({
      bookStoreId,
    });
    const customerRepo = dataSource.getRepository(Customer);

    // Tìm khách hàng theo ID
    const customer = await customerRepo.findOne({ where: { id } });
    if (!customer) {
      throw new NotFoundException('Không tìm thấy thông tin khách hàng.');
    }

    // Kiểm tra trùng lặp Email (nếu có gửi lên để sửa)
    if (updateCustomerDto.email && updateCustomerDto.email !== customer.email) {
      const existingEmail = await customerRepo.findOne({
        where: { email: updateCustomerDto.email }
      });
      if (existingEmail) {
        throw new ConflictException('Email này đã được sử dụng bởi khách hàng khác.');
      }
    }

    // Kiểm tra trùng lặp SĐT (nếu có gửi lên để sửa)
    if (updateCustomerDto.phoneNumber && updateCustomerDto.phoneNumber !== customer.phoneNumber) {
      const existingPhone = await customerRepo.findOne({
        where: { phoneNumber: updateCustomerDto.phoneNumber }
      });
      if (existingPhone) {
        throw new ConflictException('Số điện thoại này đã được sử dụng bởi khách hàng khác.');
      }
    }

    // Cập nhật dữ liệu (chỉ update các trường có gửi lên)
    assignDefined(customer, updateCustomerDto);

    return customerRepo.save(customer);
  }

  // 2. Hàm xóa khách hàng
  async deleteCustomer(id: string, bookStoreId: string) {
    const dataSource = await this.tenantsService.getTenantConnection({
      bookStoreId,
    });
    const customerRepo = dataSource.getRepository(Customer);

    const customer = await customerRepo.findOne({ where: { id } });
    if (!customer) {
      throw new NotFoundException('Không tìm thấy khách hàng cần xóa.');
    }

    // Thực hiện xóa (Hard delete hoặc Soft delete tùy yêu cầu, ở đây dùng delete cứng)
    await customerRepo.delete(id);

    return {
      message: 'Khách hàng đã được xóa thành công.',
      id: id
    };
  }
}
