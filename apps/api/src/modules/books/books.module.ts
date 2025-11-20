import { AuthorsModule } from '@/modules/authors/authors.module';
import { CategoriesModule } from '@/modules/categories/categories.module';
import { CategoriesService } from '@/modules/categories/categories.service';
import { InventoriesModule } from '@/modules/inventories/inventories.module';
import { InventoriesService } from '@/modules/inventories/inventories.service';
import { PublishersModule } from '@/modules/publishers/publishers.module';
import { PublishersService } from '@/modules/publishers/publishers.service';
import { Module } from '@nestjs/common';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';

@Module({
  imports: [
    CategoriesModule,
    AuthorsModule,
    PublishersModule,
    InventoriesModule,
  ],
  controllers: [BooksController],
  providers: [
    BooksService,
    CategoriesService,
    PublishersService,
    InventoriesService,
  ],
  exports: [BooksService],
})
export class BooksModule {}
