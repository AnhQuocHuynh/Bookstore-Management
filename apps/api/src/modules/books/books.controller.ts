import { Body, Controller, Get, Post } from '@nestjs/common';
import { BooksService } from './books.service';
import { Roles, UserSession } from '@/common/decorators';
import { UserRole } from '@/modules/users/enums';
import { CreateBookDto } from '@/common/dtos';
import { TUserSession } from '@/common/utils';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Roles(UserRole.OWNER)
  @Post()
  async createBook(
    @Body() createBookDto: CreateBookDto,
    @UserSession() userSession: TUserSession,
  ) {
    return this.booksService.createBook(createBookDto, userSession);
  }

  @Get()
  @Roles(UserRole.CUSTOMER, UserRole.EMPLOYEE, UserRole.OWNER)
  async getBooks(@UserSession() userSession: TUserSession) {
    return this.booksService.getBooks(userSession);
  }
}
