import {
  GetEmployeesOfBookStoreQueryDto,
  GetMyBookStoresQueryDto,
} from '@/common/dtos/bookstores';
import { TUserSession } from '@/common/utils';
import { CreateBookStoreDto, UpdateBookStoreDto } from '@/database/main/dto';
import { MainBookStoreService } from '@/database/main/services/main-bookstore.service';
import { MainEmployeeMappingService } from '@/database/main/services/main-employee-mapping.service';
import { Employee } from '@/database/tenant/entities';
import { UserRole } from '@/modules/users/enums';
import { TenantService } from '@/tenants/tenant.service';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { omit } from 'lodash';

@Injectable()
export class BookStoreService {
  constructor(
    private readonly mainBookStoreService: MainBookStoreService,
    private readonly tenantService: TenantService,
    private readonly mainEmployeeMappingService: MainEmployeeMappingService,
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
    userSession: TUserSession,
  ) {
    const bookStore = await this.mainBookStoreService.findBookStoreByField(
      'id',
      bookStoreId,
      {
        user: true,
      },
    );

    if (!bookStore) throw new NotFoundException('Bookstore not found.');

    if (bookStore.user.id !== userSession.userId) {
      throw new ForbiddenException(
        'You are only allowed to update the store you own.',
      );
    }

    const { phoneNumber, name } = updateBookStoreDto;

    if (phoneNumber) {
      const existingPhoneNumber =
        await this.mainBookStoreService.findBookStoreByField(
          'phoneNumber',
          phoneNumber,
        );

      if (existingPhoneNumber && existingPhoneNumber.id !== bookStore.id) {
        throw new ConflictException(
          `Bookstore with phone ${phoneNumber} has been existed.`,
        );
      }
    }

    if (name) {
      const existingName = await this.mainBookStoreService.findBookStoreByField(
        'name',
        name,
      );

      if (existingName && existingName.id !== bookStore.id) {
        throw new ConflictException(
          `Bookstore with name ${name} has been existed.`,
        );
      }
    }

    await this.mainBookStoreService.updateBookStore(
      updateBookStoreDto,
      bookStoreId,
    );

    return {
      message: 'Bookstore updated successfully.',
    };
  }

  async getMyBookStores(
    userSession: TUserSession,
    getMyBookStoresQueryDto: GetMyBookStoresQueryDto,
  ) {
    const { userId, role } = userSession;

    if (role === UserRole.OWNER)
      return this.mainBookStoreService.getBookStoresOfUser(userId);

    const { employeeEmail } = getMyBookStoresQueryDto;

    if (!employeeEmail?.trim()) {
      throw new BadRequestException('Employee email is required.');
    }

    const employeeMappings =
      await this.mainEmployeeMappingService.findBookStoresOfEmployee(
        employeeEmail,
      );

    return employeeMappings.map((em) => em.bookstore);
  }

  async getEmployeesOfBookStore(
    userSession: TUserSession,
    bookStoreId: string,
    getEmployeesOfBookStoreQueryDto: GetEmployeesOfBookStoreQueryDto,
  ) {
    const {} = userSession;

    const bookStore = await this.mainBookStoreService.findBookStoreByField(
      'id',
      bookStoreId,
      {
        user: true,
      },
    );

    if (!bookStore)
      throw new NotFoundException(
        `Bookstore with id ${bookStoreId} not found.`,
      );

    if (bookStore.user.id !== userSession.userId)
      throw new ForbiddenException(
        'You are only allowed to update the store you own.',
      );

    const { employeeRole, isActive, isFirstLogin } =
      getEmployeesOfBookStoreQueryDto;

    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const employeeRepo = dataSource.getRepository(Employee);

    const qb = employeeRepo
      .createQueryBuilder('employee')
      .leftJoinAndSelect('employee.user', 'user');

    if (employeeRole) {
      qb.andWhere('user.role = :employeeRole', { employeeRole });
    }

    if (typeof isActive === 'boolean') {
      qb.andWhere('employee.isActive = :isActive', { isActive });
    }

    if (typeof isFirstLogin === 'boolean') {
      qb.andWhere('employee.isFirstLogin = :isFirstLogin', { isFirstLogin });
    }

    const employees = await qb.getMany();

    return employees.map((e) => omit(e, ['password']));
  }
}
