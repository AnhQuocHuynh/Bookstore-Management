import { Roles, UserSession } from '@/common/decorators';
import { TUserSession } from '@/common/utils';
import { UserRole } from '@/modules/users/enums';
import { Controller, Get } from '@nestjs/common';
import { BooksService } from './books.service';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get()
  @Roles(UserRole.CUSTOMER, UserRole.EMPLOYEE, UserRole.OWNER)
  async getBooks(@UserSession() userSession: TUserSession) {
    return this.booksService.getBooks(userSession);
  }
}
