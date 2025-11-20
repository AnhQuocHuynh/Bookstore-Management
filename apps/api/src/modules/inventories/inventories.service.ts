import { CreateInventoryDto } from '@/common/dtos';
import { Inventory, InventoryLog } from '@/database/tenant/entities';
import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class InventoriesService {
  constructor() {}

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
}
