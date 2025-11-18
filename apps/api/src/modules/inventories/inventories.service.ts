import { CreateInventoryDto } from '@/common/dtos';
import { TUserSession } from '@/common/utils';
import { Inventory } from '@/database/tenant/entities';
import { TenantService } from '@/tenants/tenant.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class InventoriesService {
  constructor(private readonly tenantService: TenantService) {}

  async createNewInventory(
    createInventoryDto: CreateInventoryDto,
    userSession: TUserSession,
  ) {
    const { bookStoreId } = userSession;

    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const inventoryRepo = dataSource.getRepository(Inventory);

    const newInventory = inventoryRepo.create(createInventoryDto);
    return inventoryRepo.save(newInventory);
  }
}
