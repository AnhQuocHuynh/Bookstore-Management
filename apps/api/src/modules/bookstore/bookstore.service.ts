import {
  GetBookStoresQueryDto,
  GetEmployeesOfBookStoreQueryDto,
  GetMyBookStoresQueryDto,
} from '@/common/dtos/bookstores';
import { EmailTemplateNameEnum } from '@/common/enums';
import {
  generateSecurePassword,
  hashPassword,
  TUserSession,
} from '@/common/utils';
import { CreateBookStoreDto, UpdateBookStoreDto } from '@/database/main/dto';
import { MainBookStoreService } from '@/database/main/services/main-bookstore.service';
import { MainEmployeeMappingService } from '@/database/main/services/main-employee-mapping.service';
import { Employee } from '@/database/tenant/entities';
import { EmailService } from '@/modules/email/email.service';
import { UserRole } from '@/modules/users/enums';
import { TenantService } from '@/tenants/tenant.service';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { omit } from 'lodash';

@Injectable()
export class BookStoreService {
  constructor(
    private readonly mainBookStoreService: MainBookStoreService,
    private readonly tenantService: TenantService,
    private readonly mainEmployeeMappingService: MainEmployeeMappingService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async getBookStores(getBookStoresQueryDto: GetBookStoresQueryDto) {
    const { token } = getBookStoresQueryDto;

    if (token?.trim()) {
      try {
        const payload = await this.jwtService.verifyAsync<{
          role: UserRole;
          email?: string;
          username?: string;
        }>(token, {
          secret: this.configService.get('jwt_secret'),
        });

        const { role, email, username } = payload;

        if (email?.trim() && role === UserRole.OWNER) {
          const bookStores = await this.mainBookStoreService.findBookStores({
            user: {
              email,
            },
          });
          return bookStores.map((b) => omit(b, ['user']));
        }

        if (username?.trim() && role === UserRole.EMPLOYEE) {
          const employeeMappings =
            await this.mainEmployeeMappingService.findBookStoresOfEmployee(
              username,
            );
          return employeeMappings.map((em) => em.bookstore);
        }
      } catch (errror) {
        console.error('Error verify token: ', errror);
        throw new UnauthorizedException('Invalid or expired token.');
      }
    }

    return this.mainBookStoreService.findBookStores();
  }

  async getBookStore(id: string) {
    const result = await this.mainBookStoreService.findBookStoreByField(
      'id',
      id,
      {
        user: true,
      },
    );

    if (!result) {
      throw new NotFoundException('Không tìm thấy thông tin nhà sách.');
    }

    return omit(result, ['user.password']);
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

    const newBookStore = await this.getBookStore(bookStore.id);

    return {
      message: 'Đã tạo mới nhà sách thành công.',
      data: newBookStore,
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
      message: 'Thông tin nhà sách đã được cập nhật thành công.',
      data: await this.getBookStore(bookStoreId),
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
    const { userId } = userSession;

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

    if (bookStore.user.id !== userId)
      throw new ForbiddenException(
        'You are only allowed to update the store you own.',
      );

    const { employeeRole, isActive, isFirstLogin } =
      getEmployeesOfBookStoreQueryDto;

    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const employeeRepo = dataSource.getRepository(Employee);

    const qb = employeeRepo.createQueryBuilder('employee');

    if (employeeRole) {
      qb.andWhere('employee.role = :employeeRole', { employeeRole });
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

  async updateEmployeePassword(
    userSession: TUserSession,
    bookStoreId: string,
    employeeId: string,
  ) {
    const { userId } = userSession;

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

    if (bookStore.user.id !== userId)
      throw new ForbiddenException(
        'You are not allowed to perform actions on a bookstore you do not own.',
      );

    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const employeeRepo = dataSource.getRepository(Employee);

    const employee = await employeeRepo.findOne({
      where: {
        id: employeeId,
      },
    });

    if (!employee) throw new NotFoundException(`Employee info not found.`);

    const newRandomPassword = generateSecurePassword();

    employee.password = await hashPassword(newRandomPassword);
    employee.isFirstLogin = true;
    await employeeRepo.save(employee);

    await this.emailService.handleSendEmail(
      employee.email,
      EmailTemplateNameEnum.EMAIL_EMPLOYEE_PASSWORD_RESET,
      {
        bookStoreName: bookStore.name,
        fullName: employee.fullName,
        username: employee.username,
        password: newRandomPassword,
        loginUrl: `${this.configService.get<string>('frontend_url', '')}/auth/login`,
      },
    );

    return {
      message: 'Mật khẩu của nhân viên đã được cập nhật thành công.',
    };
  }
}
