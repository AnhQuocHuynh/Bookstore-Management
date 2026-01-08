import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { ProductsModule } from '@/modules/products/products.module';
import { ProductsService } from '@/modules/products/products.service';
import { BooksModule } from '@/modules/books/books.module';
import { SupplierModule } from '@/modules/suppliers/supplier.module';
import { CategoriesModule } from '@/modules/categories/categories.module';
import { InventoriesModule } from '@/modules/inventories/inventories.module';

@Module({
  imports: [
    ProductsModule,
    BooksModule,
    SupplierModule,
    CategoriesModule,
    InventoriesModule,
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService, ProductsService],
})
export class TransactionsModule {}
