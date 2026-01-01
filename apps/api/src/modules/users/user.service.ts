import { EMPLOYEE_ROLE_PREFIX } from '@/common/constants';
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
  ConflictException,
  ForbiddenException,
  GoneException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { omit } from 'lodash';
import { Repository } from 'typeorm';

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

    if (!bookStoreId?.trim() || role === UserRole.OWNER) {
      const user = await this.mainUserService.findUserByField('id', userId);

      if (!user)
        throw new NotFoundException('Không tìm thấy thông tin của bạn.');

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

      if (!employee)
        throw new NotFoundException('Không tìm thấy thông tin của bạn.');

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
      throw new UnauthorizedException('Không xác thực được yêu cầu của bạn.');

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

    if (!bookStoreData || !bookStoreData.isActive)
      throw new NotFoundException('Không tìm thấy thông tin nhà sách của bạn.');

    const employeeRepo = dataSource.getRepository(Employee);

    const existingPhoneNumber = await employeeRepo.findOne({
      where: {
        phoneNumber,
      },
    });

    if (existingPhoneNumber) {
      throw new ConflictException(
        'Số điện thoại này đã được một nhân viên trong cửa hàng sử dụng.',
      );
    }

    const existingEmail = await employeeRepo.findOne({
      where: {
        email: employeeEmail,
      },
    });

    if (existingEmail) {
      throw new ForbiddenException(
        'Email này đã được một nhân viên trong cửa hàng sử dụng.',
      );
    }

    const randomPassword = generateSecurePassword();
    const birthDateString = birthDate.toISOString().split('T')[0];
    const username = generateUsername(fullName, birthDateString);
    const employeeCode = await this.generateEmployeeCode(role, employeeRepo);

    const newEmployee = employeeRepo.create({
      fullName,
      phoneNumber,
      username,
      password: await hashPassword(randomPassword),
      role,
      email: employeeEmail,
      birthDate,
      employeeCode,
      avatarUrl: 'https://github.com/shadcn.png',
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
        'Tài khoản nhân viên đã được tạo. Thông tin đăng nhập đã được gửi qua email.',
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
      throw new GoneException('Token đã hết hạn hoặc không hợp lệ.');
    }

    if (!payload?.username?.trim() || !payload?.bookStoreId?.trim())
      throw new GoneException('Token không hợp lệ hoặc đã hết hạn.');

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

    if (!employee)
      throw new NotFoundException(`Không tìm thấy thông tin của bạn.`);

    if (!employee.isFirstLogin) {
      throw new ForbiddenException(
        'Hành động này chỉ có thể thực hiện trong lần đăng nhập đầu tiên.',
      );
    }

    if (!(await verifyPassword(currentPassword, employee.password))) {
      throw new UnauthorizedException(`Mật khẩu hiện tại không khớp.`);
    }

    employee.password = await hashPassword(newPassword);
    employee.isFirstLogin = false;
    await employeeRepo.save(employee);

    return {
      message: 'Mật khẩu đã được cập nhật thành công.',
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
          throw new ConflictException('Số điện thoại này đã được sử dụng.');
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
          throw new ConflictException('Số điện thoại này đã được sử dụng.');
        }
      }

      const employee = await employeeRepo.findOne({
        where: {
          id: userId,
        },
      });

      if (!employee)
        throw new NotFoundException('Không tìm thấy thông tin của bạn.');

      Object.assign(employee, updateProfileDto);
      await employeeRepo.save(employee);
    }

    return {
      message: 'Thông tin của bạn đã được cập nhật thành công.',
      data: await this.getMe(userSession),
    };
  }

  private async generateEmployeeCode(
    role: EmployeeRole,
    employeeRepo: Repository<Employee>,
  ): Promise<string> {
    const prefix = EMPLOYEE_ROLE_PREFIX[role];

    const lastEmployee = await employeeRepo.findOne({
      where: { role },
      order: { createdAt: 'DESC' },
      select: {
        employeeCode: true,
      },
    });

    const lastNumber = lastEmployee?.employeeCode
      ? parseInt(lastEmployee.employeeCode.replace(prefix, ''), 10)
      : 0;

    const nextNumber = lastNumber + 1;

    return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
  }
}
