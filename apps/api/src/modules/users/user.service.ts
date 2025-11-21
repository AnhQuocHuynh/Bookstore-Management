import {
  generateSecurePassword,
  generateUsername,
  hashPassword,
} from '@/common/utils';
import { TUserSession } from '@/common/utils/types';
import { MainUserService } from '@/database/main/services/main-user.service';
import { Employee } from '@/database/tenant/entities';
import { CreateEmployeeByOwnerDto } from '@/modules/users/dto';
import { UserRole } from '@/modules/users/enums';
import { TenantService } from '@/tenants/tenant.service';
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { omit } from 'lodash';

@Injectable()
export class UserService {
  constructor(
    private readonly tenantService: TenantService,
    private readonly mainUserService: MainUserService,
  ) {}
  async getMe(userSession: TUserSession) {
    const { userId, bookStoreId, role } = userSession;

    if (role === UserRole.CUSTOMER) {
      throw new ForbiddenException(
        'Customer is not allowed to perform this action.',
      );
    }

    if (!bookStoreId?.trim() || role === UserRole.OWNER) {
      const user = await this.mainUserService.findUserByField('id', userId);
      if (!user) throw new NotFoundException('User not found.');

      return omit(user, ['password']);
    } else {
      const dataSource = await this.tenantService.getTenantConnection({
        bookStoreId,
      });

      const employeeRepo = dataSource.getRepository(Employee);

      const employee = await employeeRepo.findOne({
        where: {
          id: userId,
        },
      });

      if (!employee) throw new NotFoundException('Your profile not found.');

      return omit(employee, ['password']);
    }
  }

  async createEmployeeByOwner(
    userSession: TUserSession,
    createEmployeeByOwnerDto: CreateEmployeeByOwnerDto,
  ) {
    const { fullName, phoneNumber, role } = createEmployeeByOwnerDto;
    const { bookStoreId } = userSession;

    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const employeeRepo = dataSource.getRepository(Employee);

    const existingPhoneNumber = await employeeRepo.findOne({
      where: {
        phoneNumber,
      },
    });

    if (existingPhoneNumber) {
      throw new ConflictException(
        'An employee member in this bookstore is already using this phone number.',
      );
    }

    const newEmployee = employeeRepo.create({
      fullName,
      phoneNumber,
      username: generateUsername(),
      password: await hashPassword(generateSecurePassword()),
      role,
    });

    await employeeRepo.save(newEmployee);
  }
}
