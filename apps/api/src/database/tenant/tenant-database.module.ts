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
  Invitation,
  Otp,
  Publisher,
  Purchase,
  PurchaseDetail,
  ReturnExchangeDetail,
  RT,
  Supplier,
  User,
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
      Invitation,
      AuthorizationCode,
      Customer,
      User,
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
    ]),
  ],
  exports: [TypeOrmModule],
})
export class TenantDatabaseModule {}
