import { Public, Roles, UserSession } from '@/common/decorators';
import { TUserSession } from '@/common/utils';
import { CreateBookStoreDto, UpdateBookStoreDto } from '@/database/main/dto';
import { UserRole } from '@/modules/users/enums';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { BookStoreService } from './bookstore.service';
import {
  GetEmployeesOfBookStoreQueryDto,
  GetMyBookStoresQueryDto,
} from '@/common/dtos/bookstores';

@Controller('bookstores')
export class BookStoreController {
  constructor(private readonly bookStoreService: BookStoreService) {}

  @Public()
  @Get()
  async getBookStores() {
    return this.bookStoreService.getBookStores();
  }

  @Get('detail/:id')
  async getBookStore(@Param('id', ParseUUIDPipe) id: string) {
    return this.bookStoreService.getBookStore(id);
  }

  @Get(':id/employees')
  @Roles(UserRole.OWNER)
  async getEmployeesOfBookStore(
    @Param('id', ParseUUIDPipe) bookStoreId: string,
    @Query() getEmployeesOfBookStoreQueryDto: GetEmployeesOfBookStoreQueryDto,
    @UserSession() userSession: TUserSession,
  ) {
    return this.bookStoreService.getEmployeesOfBookStore(
      userSession,
      bookStoreId,
      getEmployeesOfBookStoreQueryDto,
    );
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
    @UserSession() userSession: TUserSession,
  ) {
    return this.bookStoreService.updateBookStore(
      bookStoreId,
      updateBookStoreDto,
      userSession,
    );
  }

  @Get('my')
  @Roles(UserRole.OWNER, UserRole.EMPLOYEE)
  async getMyBookStores(
    @UserSession() userSession: TUserSession,
    @Query() getMyBookStoresQueryDto: GetMyBookStoresQueryDto,
  ) {
    return this.bookStoreService.getMyBookStores(
      userSession,
      getMyBookStoresQueryDto,
    );
  }

  @Patch(':bookStoreId/employees/:employeeId/password/reset')
  @Roles(UserRole.OWNER)
  async updateEmployeePassword(
    @UserSession() userSession: TUserSession,
    @Param('bookStoreId', ParseUUIDPipe) bookStoreId: string,
    @Param('employeeId', ParseUUIDPipe) employeeId: string,
  ) {
    return this.bookStoreService.updateEmployeePassword(
      userSession,
      bookStoreId,
      employeeId,
    );
  }
}
