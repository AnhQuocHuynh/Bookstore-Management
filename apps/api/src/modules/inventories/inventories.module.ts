import { Module } from '@nestjs/common';
import { InventoriesService } from './inventories.service';
import { TenantModule } from '@/tenants/tenant.module';
import { InventoriesController } from './inventories.controller';

@Module({
  imports: [TenantModule],
  controllers: [InventoriesController],
  providers: [InventoriesService],
  exports: [InventoriesService],
})
export class InventoriesModule {}
