import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { GetInventoryLogsQueryDto } from '@/common/dtos';
import { BookStoreId, Roles } from '@/common/decorators';
import { UserRole } from '@/modules/users/enums';
import { InventoriesService } from './inventories.service';

@Controller('inventories')
export class InventoriesController {
  constructor(private readonly inventoriesService: InventoriesService) {}

  @Get('logs')
  @Roles(UserRole.OWNER)
  async getInventoryLogs(
    @Query() query: GetInventoryLogsQueryDto,
    @BookStoreId() bookStoreId: string,
  ) {
    return this.inventoriesService.getInventoryLogs(query, bookStoreId);
  }

  @Get('logs/:id')
  @Roles(UserRole.OWNER)
  async getInventoryLogDetail(
    @Param('id', ParseUUIDPipe) id: string,
    @BookStoreId() bookStoreId: string,
  ) {
    return this.inventoriesService.getInventoryLogDetail(id, bookStoreId);
  }
}
