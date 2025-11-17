import { AuthorsModule } from '@/modules/authors/authors.module';
import { CategoriesModule } from '@/modules/categories/categories.module';
import { CategoriesService } from '@/modules/categories/categories.service';
import { PublishersModule } from '@/modules/publishers/publishers.module';
import { PublishersService } from '@/modules/publishers/publishers.service';
import { Module } from '@nestjs/common';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';

@Module({
  imports: [CategoriesModule, AuthorsModule, PublishersModule],
  controllers: [BooksController],
  providers: [BooksService, CategoriesService, PublishersService],
})
export class BooksModule {}
