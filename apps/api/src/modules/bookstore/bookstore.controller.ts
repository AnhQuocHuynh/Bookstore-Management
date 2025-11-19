import { Public, Roles, UserSession } from '@/common/decorators';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { BookStoreService } from './bookstore.service';
import { UserRole } from '@/modules/users/enums';
import { TUserSession } from '@/common/utils';
import { CreateBookStoreDto, UpdateBookStoreDto } from '@/database/main/dto';

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

  @Post()
  @Roles(UserRole.OWNER)
  async createBookStore(
    @UserSession() userSession: TUserSession,
    @Body() createBookStoreDto: CreateBookStoreDto,
  ) {
    return this.bookStoreService.createBookStore(
      userSession,
      createBookStoreDto,
    );
  }

  @Patch(':id')
  @Roles(UserRole.OWNER)
  async updateBookStore(
    @Param('id', ParseUUIDPipe) bookStoreId: string,
    @Body() updateBookStoreDto: UpdateBookStoreDto,
  ) {
    return this.bookStoreService.updateBookStore(
      bookStoreId,
      updateBookStoreDto,
    );
  }

  @Get('my')
  @Roles(UserRole.OWNER, UserRole.EMPLOYEE)
  async getMyBookStores(@UserSession() userSession: TUserSession) {
    return this.bookStoreService.getMyBookStores(userSession);
  }
}
