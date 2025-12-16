import { assignDefined, TUserSession } from '@/common/utils';
import { Supplier } from '@/database/tenant/entities';
import { CreateSupplierDto, UpdateSupplierDto } from '@/modules/suppliers/dto';
import { TenantService } from '@/tenants/tenant.service';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';

@Injectable()
export class SupplierService {
  constructor(private readonly tenantService: TenantService) {}

  async findSupplierByField(
    field: keyof Supplier,
    value: string,
    repo: Repository<Supplier>,
  ) {
    return (
      repo.findOne({
        where: {
          [field]: value,
        },
      }) ?? null
    );
  }

  async createSupplier(
    createSupplierDto: CreateSupplierDto,
    bookStoreId: string,
  ) {
    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const { email, phoneNumber } = createSupplierDto;
    const supplierRepo = dataSource.getRepository(Supplier);

    const existingSupplierEmail = await supplierRepo.findOne({
      where: {
        email,
      },
    });

    if (existingSupplierEmail)
      throw new ConflictException(
        'Email này đã được sử dụng bởi một nhà cung cấp khác.',
      );

    const existingSupplierPhone = await supplierRepo.findOne({
      where: {
        phoneNumber,
      },
    });

    if (existingSupplierPhone)
      throw new ConflictException(
        'Số điện thoại này đã được sử dụng bởi một nhà cung cấp khác.',
      );

    const newSupplier = supplierRepo.create(createSupplierDto);

    return supplierRepo.save(newSupplier);
  }

  async getSuppliers(bookStoreId: string) {
    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const supplierRepo = dataSource.getRepository(Supplier);
    return supplierRepo.find();
  }

  async getSupplierById(id: string, bookStoreId: string) {
    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const supplierRepo = dataSource.getRepository(Supplier);

    const findSupplier = await supplierRepo.findOne({
      where: {
        id,
      },
    });

    if (!findSupplier)
      throw new NotFoundException('Không tìm thấy thông tin nhà cung cấp.');

    return findSupplier;
  }

  async updateSupplierById(
    id: string,
    updateSupplierDto: UpdateSupplierDto,
    bookStoreId: string,
  ) {
    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const supplierRepo = dataSource.getRepository(Supplier);

    const findSupplier = await this.getSupplierById(id, bookStoreId);

    assignDefined(findSupplier, updateSupplierDto);
    await supplierRepo.save(findSupplier);

    return this.getSupplierById(id, bookStoreId);
  }

  async deleteSupplierById(id: string, bookStoreId: string) {
    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const supplierRepo = dataSource.getRepository(Supplier);
    await this.getSupplierById(id, bookStoreId);
    await supplierRepo.delete({
      id,
    });

    return this.getSuppliers(bookStoreId);
  }
}
