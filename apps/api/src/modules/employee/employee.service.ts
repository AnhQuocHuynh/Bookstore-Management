import { assignDefined } from '@/common/utils';
import {
  GetEmployeeQueryDto,
  GetEmployeesQueryDto,
  UpdateEmployeeDto,
  ToggleEmployeeStatusDto,
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

@Injectable()
export class EmployeeService {
  constructor(private readonly tenantService: TenantService) {}

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
        'At least one query parameter (id, email, or username) must be provided.',
      );
    }

    const queryCount = [id, email, username].filter(Boolean).length;
    if (queryCount > 1) {
      throw new BadRequestException(
        'Only one query parameter (id, email, or username) can be provided at a time.',
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
      throw new NotFoundException('Employee not found.');
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
          'An employee with this email already exists.',
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
          'An employee with this phone number already exists.',
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
}
