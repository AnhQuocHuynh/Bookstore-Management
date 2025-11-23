import {
  Author,
  AuthorizationCode,
  Book,
  Category,
  Customer,
  CustomerCompany,
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
      CustomerCompany,
      PurchaseOrder,
      PurchaseOrderDetail,
      ReturnOrder,
      ReturnOrderDetail,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class TenantDatabaseModule {}
