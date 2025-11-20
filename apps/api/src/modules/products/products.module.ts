import { BooksModule } from '@/modules/books/books.module';
import { BooksService } from '@/modules/books/books.service';
import { CategoriesModule } from '@/modules/categories/categories.module';
import { CategoriesService } from '@/modules/categories/categories.service';
import { InventoriesModule } from '@/modules/inventories/inventories.module';
import { InventoriesService } from '@/modules/inventories/inventories.service';
import { SupplierModule } from '@/modules/suppliers/supplier.module';
import { SupplierService } from '@/modules/suppliers/supplier.service';
import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  imports: [BooksModule, SupplierModule, CategoriesModule, InventoriesModule],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    BooksService,
    SupplierService,
    CategoriesService,
    InventoriesService,
  ],
})
export class ProductsModule {}
