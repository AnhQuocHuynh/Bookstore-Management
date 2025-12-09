import { CreateInventoryDto, GetInventoryLogsQueryDto } from '@/common/dtos';
import { Inventory, InventoryLog } from '@/database/tenant/entities';
import { TenantService } from '@/tenants/tenant.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { omit } from 'lodash';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class InventoriesService {
  constructor(private readonly tenantService: TenantService) {}

  async createNewInventory(
    createInventoryDto: CreateInventoryDto,
    manager: EntityManager,
  ) {
    const inventoryRepo = manager.getRepository(Inventory);
    const newInventory = inventoryRepo.create(createInventoryDto);
    return inventoryRepo.save(newInventory);
  }

  async createNewInventoryLog(
    data: Partial<InventoryLog>,
    repo: Repository<InventoryLog>,
  ) {
    const newInventoryLog = repo.create(data);
    await repo.save(newInventoryLog);
  }

  async getInventoryLogs(query: GetInventoryLogsQueryDto, bookStoreId: string) {
    const {
      page = 1,
      limit = 10,
      inventoryId,
      employeeId,
      action,
      fromDate,
      toDate,
    } = query;
    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });
    const repo = dataSource.getRepository(InventoryLog);

    const qb = repo
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.inventory', 'inventory')
      .leftJoinAndSelect('log.employee', 'employee')
      .orderBy('log.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (inventoryId) {
      qb.andWhere('inventory.id = :inventoryId', { inventoryId });
    }

    if (employeeId) {
      qb.andWhere('employee.id = :employeeId', { employeeId });
    }

    if (action) {
      qb.andWhere('log.action = :action', { action });
    }

    if (fromDate) {
      qb.andWhere('log.createdAt >= :fromDate', { fromDate });
    }

    if (toDate) {
      qb.andWhere('log.createdAt <= :toDate', { toDate });
    }

    const [data, total] = await qb.getManyAndCount();

    return {
      data: data.map((log) => ({
        ...log,
        employee: log.employee ? omit(log.employee, ['password']) : null,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getInventoryLogDetail(id: string, bookStoreId: string) {
    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });
    const repo = dataSource.getRepository(InventoryLog);

    const log = await repo.findOne({
      where: { id },
      relations: ['inventory', 'employee'],
    });

    if (!log) {
      throw new NotFoundException('Không tìm thấy nhật ký kho.');
    }

    return {
      ...log,
      employee: log.employee ? omit(log.employee, ['password']) : null,
    };
  }
}
