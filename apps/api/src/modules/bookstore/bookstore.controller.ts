import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { BookStoreService } from './bookstore.service';
import { Public } from '@/common/decorators';

@Controller('bookstores')
export class BookStoreController {
  constructor(private readonly bookStoreService: BookStoreService) {}

  @Public()
  @Get()
  async getBookStores() {
    return this.bookStoreService.getBookStores();
  }

  @Get(':id')
  async getBookStore(@Param('id', ParseUUIDPipe) id: string) {
    return this.bookStoreService.getBookStore(id);
  }
}
