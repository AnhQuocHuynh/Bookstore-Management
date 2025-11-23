import { BookStoreId, Roles } from '@/common/decorators';
import {
  GetEmployeeQueryDto,
  GetEmployeesQueryDto,
  UpdateEmployeeDto,
  ToggleEmployeeStatusDto,
} from '@/common/dtos';
import { UserRole } from '@/modules/users/enums';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { EmployeeService } from './employee.service';

@Controller('employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get()
  async getEmployees(
    @BookStoreId() bookStoreId: string,
    @Query() query: GetEmployeesQueryDto,
  ) {
    return this.employeeService.getEmployees(bookStoreId, query);
  }

  @Get('query')
  async getEmployee(
    @BookStoreId() bookStoreId: string,
    @Query() query: GetEmployeeQueryDto,
  ) {
    return this.employeeService.getEmployee(bookStoreId, query);
  }

  @Patch(':id')
  @Roles(UserRole.OWNER)
  async updateEmployee(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
    @BookStoreId() bookStoreId: string,
  ) {
    return this.employeeService.updateEmployee(
      id,
      updateEmployeeDto,
      bookStoreId,
    );
  }

  @Patch(':id/status')
  @Roles(UserRole.OWNER)
  async toggleEmployeeStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() toggleEmployeeStatusDto: ToggleEmployeeStatusDto,
    @BookStoreId() bookStoreId: string,
  ) {
    return this.employeeService.toggleEmployeeStatus(
      id,
      toggleEmployeeStatusDto,
      bookStoreId,
    );
  }
}
