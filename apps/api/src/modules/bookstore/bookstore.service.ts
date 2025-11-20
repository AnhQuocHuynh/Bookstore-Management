import { GetBookStoresQueryDto } from '@/common/dtos/bookstores';
import { TUserSession } from '@/common/utils';
import { CreateBookStoreDto, UpdateBookStoreDto } from '@/database/main/dto';
import { MainBookStoreService } from '@/database/main/services/main-bookstore.service';
import { Employee } from '@/database/tenant/entities';
import { UserRole } from '@/modules/users/enums';
import { TenantService } from '@/tenants/tenant.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BookStoreService {
  constructor(
    private readonly mainBookStoreService: MainBookStoreService,
    private readonly tenantService: TenantService,
  ) {}

  async getBookStores() {
    return this.mainBookStoreService.findBookStores();
  }

  async getBookStore(id: string) {
    return this.mainBookStoreService.findBookStoreByField('id', id);
  }

  async createBookStore(
    userSession: TUserSession,
    createBookStoreDto: CreateBookStoreDto,
  ) {
    const bookStore = await this.mainBookStoreService.createNewBookStore(
      createBookStoreDto,
      userSession.userId,
    );
    await this.mainBookStoreService.updateBookStore(
      {
        isActive: true,
      },
      bookStore.id,
    );
    return {
      message: 'Bookstore created successfully.',
      data: bookStore,
    };
  }

  async updateBookStore(
    bookStoreId: string,
    updateBookStoreDto: UpdateBookStoreDto,
  ) {
    await this.mainBookStoreService.updateBookStore(
      updateBookStoreDto,
      bookStoreId,
    );
    return {
      message: 'Bookstore updated successfully.',
    };
  }

  async getMyBookStores(userSession: TUserSession) {
    const { userId, role } = userSession;

    if (role === UserRole.OWNER)
      return this.mainBookStoreService.getBookStoresOfUser(userId);

    const allBookStores = await this.mainBookStoreService.findBookStores();

    const bookStores = (
      await Promise.all(
        allBookStores.map(async (bookStore) => {
          const dataSource = await this.tenantService.getTenantConnection({
            bookStoreId: bookStore.id,
          });

          const employeeRepo = dataSource.getRepository(Employee);

          const exists = await employeeRepo.count({
            where: { userId },
          });

          return exists ? bookStore : null;
        }),
      )
    ).filter(Boolean);

    return bookStores;
  }
}
