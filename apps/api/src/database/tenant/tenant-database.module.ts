import {
  Author,
  AuthorizationCode,
  Book,
  Category,
  Customer,
  DisplayLog,
  DisplayProduct,
  DisplayShelf,
  Employee,
  Inventory,
  Otp,
  Publisher,
  PurchaseOrder,
  PurchaseOrderDetail,
  ReturnOrder,
  ReturnOrderDetail,
  RT,
  SchedulerEntry,
  Shift,
  Supplier,
} from '@/database/tenant/entities';
import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Book,
      Employee,
      RT,
      AuthorizationCode,
      Customer,
      Otp,
      Author,
      Category,
      Publisher,
      Supplier,
      Inventory,
      DisplayLog,
      DisplayProduct,
      DisplayShelf,
      PurchaseOrder,
      PurchaseOrderDetail,
      ReturnOrder,
      ReturnOrderDetail,
      SchedulerEntry,
      Shift,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class TenantDatabaseModule {}
