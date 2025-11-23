import { BookStoreId } from '@/common/decorators';
import { Controller, Get, Query } from '@nestjs/common';
import { GetEmployeeQueryDto, GetEmployeesQueryDto } from './dto';
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
}
