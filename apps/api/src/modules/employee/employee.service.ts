import {
  assignDefined,
  getEmployeeRoleLabel,
  handleGenerateUserNotificationContent,
  TUserSession,
} from '@/common/utils';
import {
  GetEmployeeQueryDto,
  GetEmployeesQueryDto,
  UpdateEmployeeDto,
  ToggleEmployeeStatusDto,
  UpdateEmployeeRoleDto,
} from '@/common/dtos';
import { Employee } from '@/database/tenant/entities';
import { TenantService } from '@/tenants/tenant.service';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FindOptionsWhere } from 'typeorm';
import { NotificationsService } from '@/modules/notifications/notifications.service';
import { NotificationType, ReceiverType } from '@/common/enums';

@Injectable()
export class EmployeeService {
  constructor(
    private readonly tenantService: TenantService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getEmployees(bookStoreId: string, query: GetEmployeesQueryDto) {
    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const employeeRepo = dataSource.getRepository(Employee);

    const defaultPage = 1;
    const defaultLimit = 10;
    const maxLimit = 100;

    const page = query.page || defaultPage;
    let limit = query.limit || defaultLimit;

    if (limit > maxLimit) {
      limit = maxLimit;
    }

    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Employee> = {};

    if (query.role) {
      where.role = query.role;
    }

    if (typeof query.isActive === 'boolean') {
      where.isActive = query.isActive;
    }

    const [employees, total] = await employeeRepo.findAndCount({
      where,
      skip,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: employees,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async getEmployee(bookStoreId: string, query: GetEmployeeQueryDto) {
    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const employeeRepo = dataSource.getRepository(Employee);

    const { id, email, username } = query;

    if (!id && !email && !username) {
      throw new BadRequestException(
        'Vui lòng cung cấp ít nhất một tham số truy vấn (id, email hoặc username).',
      );
    }

    const queryCount = [id, email, username].filter(Boolean).length;
    if (queryCount > 1) {
      throw new BadRequestException(
        'Chỉ có thể cung cấp một tham số truy vấn (id, email hoặc username) tại một thời điểm.',
      );
    }

    let where: FindOptionsWhere<Employee>;
    if (id) {
      where = { id } as FindOptionsWhere<Employee>;
    } else if (email) {
      where = { email } as FindOptionsWhere<Employee>;
    } else {
      where = { username } as FindOptionsWhere<Employee>;
    }

    const employee = await employeeRepo.findOne({
      where,
    });

    if (!employee) {
      throw new NotFoundException('Không tìm thấy thông tin nhân viên.');
    }

    return employee;
  }

  async updateEmployee(
    id: string,
    updateEmployeeDto: UpdateEmployeeDto,
    bookStoreId: string,
  ) {
    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const employeeRepo = dataSource.getRepository(Employee);

    const employee = await this.getEmployee(bookStoreId, { id });

    if (updateEmployeeDto.email && updateEmployeeDto.email !== employee.email) {
      const existingEmployee = await employeeRepo.findOne({
        where: {
          email: updateEmployeeDto.email,
        },
      });

      if (existingEmployee) {
        throw new ConflictException(
          'Email này đã được sử dụng bởi một nhân viên khác.',
        );
      }
    }

    if (
      updateEmployeeDto.phoneNumber &&
      updateEmployeeDto.phoneNumber !== employee.phoneNumber
    ) {
      const existingEmployee = await employeeRepo.findOne({
        where: {
          phoneNumber: updateEmployeeDto.phoneNumber,
        },
      });

      if (existingEmployee) {
        throw new ConflictException(
          'Số điện thoại này đã được sử dụng bởi một nhân viên khác.',
        );
      }
    }

    assignDefined(employee, updateEmployeeDto);
    await employeeRepo.save(employee);

    return this.getEmployee(bookStoreId, { id });
  }

  async toggleEmployeeStatus(
    id: string,
    toggleEmployeeStatusDto: ToggleEmployeeStatusDto,
    bookStoreId: string,
  ) {
    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const employeeRepo = dataSource.getRepository(Employee);

    const employee = await this.getEmployee(bookStoreId, { id });

    employee.isActive = toggleEmployeeStatusDto.isActive;
    await employeeRepo.save(employee);

    return this.getEmployee(bookStoreId, { id });
  }

  async updateEmployeeRole(
    id: string,
    updateEmployeeRoleDto: UpdateEmployeeRoleDto,
    userSession: TUserSession,
  ) {
    const { bookStoreId, userId } = userSession;
    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const employeeRepo = dataSource.getRepository(Employee);

    const employee = await employeeRepo.findOne({
      where: {
        id,
      },
    });

    if (!employee) {
      throw new NotFoundException('Không tìm thấy thông tin nhân viên.');
    }

    const { role } = updateEmployeeRoleDto;

    employee.role = role;
    await employeeRepo.save(employee);

    await this.notificationsService.createNotification(
      {
        receiverId: employee.id,
        receiverType: ReceiverType.EMPLOYEE,
        content: handleGenerateUserNotificationContent(
          NotificationType.ROLE_CHANGED,
          {
            isOwner: false,
            role: getEmployeeRoleLabel(role),
            time: new Date(),
          },
        ),
        notificationType: NotificationType.ROLE_CHANGED,
      },
      bookStoreId,
    );

    await this.notificationsService.createNotification(
      {
        receiverId: userId,
        receiverType: ReceiverType.OWNER,
        content: handleGenerateUserNotificationContent(
          NotificationType.ROLE_CHANGED,
          {
            isOwner: true,
            role: getEmployeeRoleLabel(role),
            time: new Date(),
            employeeName: employee.fullName,
          },
        ),
        notificationType: NotificationType.ROLE_CHANGED,
      },
      bookStoreId,
    );

    return this.getEmployee(bookStoreId ?? '', {
      id,
    });
  }
}
