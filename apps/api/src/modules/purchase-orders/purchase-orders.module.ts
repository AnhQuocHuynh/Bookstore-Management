import { BooksModule } from '@/modules/books/books.module';
import { CategoriesModule } from '@/modules/categories/categories.module';
import { InventoriesModule } from '@/modules/inventories/inventories.module';
import { ProductsModule } from '@/modules/products/products.module';
import { ProductsService } from '@/modules/products/products.service';
import { SupplierModule } from '@/modules/suppliers/supplier.module';
import { Module } from '@nestjs/common';
import { PurchaseOrdersController } from './purchase-orders.controller';
import { PurchaseOrdersService } from './purchase-orders.service';

@Module({
  imports: [
    ProductsModule,
    BooksModule,
    SupplierModule,
    CategoriesModule,
    InventoriesModule,
  ],
  controllers: [PurchaseOrdersController],
  providers: [PurchaseOrdersService, ProductsService],
})
export class PurchaseOrdersModule {}
