import { MainBookStoreService } from '@/database/main/services/main-bookstore.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BookStoreService {
  constructor(private readonly mainBookStoreService: MainBookStoreService) {}

  async getBookStores() {
    return this.mainBookStoreService.findBookStores();
  }

  async getBookStore(id: string) {
    return this.mainBookStoreService.findBookStoreByField('id', id);
  }
}
