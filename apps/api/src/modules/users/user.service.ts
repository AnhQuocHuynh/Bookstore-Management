import { EmailTemplateNameEnum, EmployeeRole } from '@/common/enums';
import {
  generateSecurePassword,
  generateUsername,
  hashPassword,
  verifyPassword,
} from '@/common/utils';
import { TUserSession } from '@/common/utils/types';
import { MainBookStoreService } from '@/database/main/services/main-bookstore.service';
import { MainEmployeeMappingService } from '@/database/main/services/main-employee-mapping.service';
import { MainUserService } from '@/database/main/services/main-user.service';
import { Employee } from '@/database/tenant/entities';
import { EmailService } from '@/modules/email/email.service';
import {
  CreateEmployeeByOwnerDto,
  UpdateOwnPasswordDto,
  UpdateProfileDto,
} from '@/modules/users/dto';
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
export class UserService {
  constructor(
    private readonly tenantService: TenantService,
    private readonly mainUserService: MainUserService,
    private readonly emailService: EmailService,
    private readonly mainBookStoreService: MainBookStoreService,
    private readonly mainEmployeeMappingService: MainEmployeeMappingService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
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
    const { fullName, phoneNumber, role, employeeEmail, birthDate } =
      createEmployeeByOwnerDto;
    const { bookStoreId } = userSession;

    if (!bookStoreId?.trim())
      throw new UnauthorizedException('Bookstore ID is missing...');

    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const bookStoreData = await this.mainBookStoreService.findBookStoreByField(
      'id',
      bookStoreId,
      {
        user: true,
      },
    );

    if (!bookStoreData)
      throw new NotFoundException('Your bookstore data not found.');

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

    const existingEmail = await employeeRepo.findOne({
      where: {
        email: employeeEmail,
      },
    });

    if (existingEmail) {
      throw new ForbiddenException(
        'An employee member in this bookstore is already using this email.',
      );
    }

    const randomPassword = generateSecurePassword();
    const birthDateString = birthDate.toISOString().split('T')[0];
    const username = generateUsername(fullName, birthDateString);

    const newEmployee = employeeRepo.create({
      fullName,
      phoneNumber,
      username,
      password: await hashPassword(randomPassword),
      role,
      email: employeeEmail,
      birthDate,
    });

    await employeeRepo.save(newEmployee);

    await this.mainEmployeeMappingService.createNewEmployeeMapping({
      username,
      bookstore: bookStoreData,
      role,
    });

    await this.emailService.handleSendEmail(
      employeeEmail,
      EmailTemplateNameEnum.EMAIL_EMPLOYEE_ACCOUNT_INFO,
      {
        employeeName: newEmployee.fullName,
        ownerName: bookStoreData.user.fullName,
        bookStoreName: bookStoreData.name,
        username,
        password: randomPassword,
        role,
        loginUrl: `${this.configService.get<string>('frontend_url', '')}/auth/login`,
      },
    );

    return {
      message:
        'Employee account has been created. An email with login details has been sent.',
    };
  }

  async updateOwnPassword(updateOwnPasswordDto: UpdateOwnPasswordDto) {
    const { currentPassword, newPassword, token } = updateOwnPasswordDto;
    let payload: { username: string; bookStoreId: string } = {
      username: '',
      bookStoreId: '',
    };

    try {
      payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('jwt_secret', ''),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired token.');
    }

    if (!payload?.username?.trim() || !payload?.bookStoreId?.trim())
      throw new UnauthorizedException('Invalid token.');

    const { username, bookStoreId } = payload;

    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const employeeRepo = dataSource.getRepository(Employee);

    const employee = await employeeRepo.findOne({
      where: {
        username,
      },
    });

    if (!employee) throw new NotFoundException(`Your profile not found.`);

    if (!employee.isFirstLogin) {
      throw new ForbiddenException(
        'This action can only be performed on first login.',
      );
    }

    if (!(await verifyPassword(currentPassword, employee.password))) {
      throw new UnauthorizedException(`Current password isn't correct.`);
    }

    employee.password = await hashPassword(newPassword);
    employee.isFirstLogin = false;
    await employeeRepo.save(employee);

    return {
      message: 'Password updated successfully.',
    };
  }

  async updateProfile(
    userSession: TUserSession,
    updateProfileDto: UpdateProfileDto,
  ) {
    const { bookStoreId, role, userId } = userSession;
    const { phoneNumber } = updateProfileDto;

    if (role === UserRole.OWNER) {
      if (phoneNumber) {
        const existingPhoneNumber = await this.mainUserService.findUserByField(
          'phoneNumber',
          phoneNumber,
        );

        if (existingPhoneNumber && existingPhoneNumber.id !== userId) {
          throw new ConflictException('This phone number is already in use.');
        }
      }

      await this.mainUserService.updateUser(updateProfileDto, userId);
    } else {
      const dataSource = await this.tenantService.getTenantConnection({
        bookStoreId,
      });

      const employeeRepo = dataSource.getRepository(Employee);

      if (phoneNumber) {
        const existingPhoneNumber = await employeeRepo.findOne({
          where: {
            phoneNumber,
          },
        });

        if (existingPhoneNumber && existingPhoneNumber.id !== userId) {
          throw new ConflictException('This phone number is already in use.');
        }
      }

      const employee = await employeeRepo.findOne({
        where: {
          id: userId,
        },
      });

      if (!employee) throw new NotFoundException('Your profile not found.');

      Object.assign(employee, updateProfileDto);
      await employeeRepo.save(employee);
    }

    return {
      message: 'Your profile updated successfully.',
    };
  }
}
