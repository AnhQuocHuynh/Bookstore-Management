import { Module } from '@nestjs/common';
import { BookStoreController } from './bookstore.controller';
import { BookStoreService } from './bookstore.service';

@Module({
  providers: [BookStoreService],
  controllers: [BookStoreController],
})
export class BookStoreModule {}
