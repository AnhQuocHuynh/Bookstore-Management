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
  Purchase,
  PurchaseDetail,
  ReturnExchangeDetail,
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
      PurchaseDetail,
      Purchase,
      Supplier,
      ReturnExchangeDetail,
      Inventory,
      DisplayLog,
      DisplayProduct,
      DisplayShelf,
      CustomerCompany,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class TenantDatabaseModule {}
