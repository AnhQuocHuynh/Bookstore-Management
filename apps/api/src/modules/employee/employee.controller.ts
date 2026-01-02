import { BookStoreId, Roles } from '@/common/decorators';
import {
  GetEmployeeQueryDto,
  GetEmployeesQueryDto,
  UpdateEmployeeDto,
  ToggleEmployeeStatusDto,
  UpdateEmployeeRoleDto,
} from '@/common/dtos';
import { UserRole } from '@/modules/users/enums';
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { EmployeeService } from './employee.service';

@Controller('employee')
@ApiTags('EmployeeController')
@ApiBearerAuth()
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @ApiOperation({
    summary: 'Lấy danh sách nhân viên',
    description: 'Đường dẫn này dùng để lấy danh sách nhân viên của cửa hàng.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    example: {
      data: [
        {
          id: '7a3ef648-3a4d-497d-80c0-68c38a148015',
          email: 'ngocanhsedev2005@gmail.com',
          username: 'nunth200508)HUvl',
          isActive: true,
          isFirstLogin: true,
          role: 'STAFF',
          fullName: 'ADC',
          address: 'abcdef',
          phoneNumber: '0393878912',
          birthDate: '2005-08-20T00:00:00.000Z',
          avatarUrl: null,
          createdAt: '2025-11-22T08:22:17.559Z',
          updatedAt: '2025-11-22T11:08:46.770Z',
        },
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    },
  })
  @Get()
  async getEmployees(
    @BookStoreId() bookStoreId: string,
    @Query() query: GetEmployeesQueryDto,
  ) {
    return this.employeeService.getEmployees(bookStoreId, query);
  }

  @ApiOperation({
    summary: 'Lấy thông tin nhân viên',
    description:
      'Đường dẫn này dùng để lấy thông tin chi tiết của một nhân viên dựa trên id, email hoặc username.',
  })
  @ApiQuery({
    name: 'id',
    required: false,
    description: 'Id của nhân viên',
    example: '7a3ef648-3a4d-497d-80c0-68c38a148015',
  })
  @ApiQuery({
    name: 'email',
    required: false,
    description: 'Email của nhân viên',
    example: 'ngocanhsedev2005@gmail.com',
  })
  @ApiQuery({
    name: 'username',
    required: false,
    description: 'Username của nhân viên',
    example: 'nunth200508)HUvl',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    example: {
      id: '7a3ef648-3a4d-497d-80c0-68c38a148015',
      email: 'ngocanhsedev2005@gmail.com',
      username: 'nunth200508)HUvl',
      isActive: true,
      isFirstLogin: true,
      role: 'STAFF',
      fullName: 'ADC',
      address: 'abcdef',
      phoneNumber: '0393878912',
      birthDate: '2005-08-20T00:00:00.000Z',
      avatarUrl: null,
      createdAt: '2025-11-22T08:22:17.559Z',
      updatedAt: '2025-11-22T11:08:46.770Z',
    },
  })
  @Get('query')
  async getEmployee(
    @BookStoreId() bookStoreId: string,
    @Query() query: GetEmployeeQueryDto,
  ) {
    return this.employeeService.getEmployee(bookStoreId, query);
  }

  @ApiOperation({
    summary: 'Cập nhật thông tin nhân viên',
    description:
      'Đường dẫn này dùng để cập nhật thông tin nhân viên, chỉ có OWNER mới có quyền thực hiện hành động này.',
  })
  @ApiParam({
    name: 'id',
    description: 'Id của nhân viên',
    example: '7a3ef648-3a4d-497d-80c0-68c38a148015',
  })
  @ApiBody({
    type: UpdateEmployeeDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    example: {
      id: '7a3ef648-3a4d-497d-80c0-68c38a148015',
      email: 'ngocanhsedev2005@gmail.com',
      username: 'nunth200508)HUvl',
      isActive: true,
      isFirstLogin: true,
      role: 'STAFF',
      fullName: 'Nguyễn Văn A',
      address: 'Hồ Chí Minh',
      phoneNumber: '0393878912',
      birthDate: '2005-08-20T00:00:00.000Z',
      avatarUrl: null,
      createdAt: '2025-11-22T08:22:17.559Z',
      updatedAt: '2025-11-22T11:08:46.770Z',
    },
  })
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

  @ApiOperation({
    summary: 'Thay đổi trạng thái nhân viên',
    description:
      'Đường dẫn này dùng để thay đổi trạng thái hoạt động của nhân viên (kích hoạt/vô hiệu hóa), chỉ có OWNER mới có quyền thực hiện hành động này.',
  })
  @ApiParam({
    name: 'id',
    description: 'Id của nhân viên',
    example: '7a3ef648-3a4d-497d-80c0-68c38a148015',
  })
  @ApiBody({
    type: ToggleEmployeeStatusDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    example: {
      id: '7a3ef648-3a4d-497d-80c0-68c38a148015',
      email: 'ngocanhsedev2005@gmail.com',
      username: 'nunth200508)HUvl',
      isActive: false,
      isFirstLogin: true,
      role: 'STAFF',
      fullName: 'ADC',
      address: 'abcdef',
      phoneNumber: '0393878912',
      birthDate: '2005-08-20T00:00:00.000Z',
      avatarUrl: null,
      createdAt: '2025-11-22T08:22:17.559Z',
      updatedAt: '2025-11-22T11:08:46.770Z',
    },
  })
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

  @ApiOperation({
    summary: 'Thay đổi vai trò của nhân viên',
    description: 'Chỉ có CHỦ NHÀ SÁCH mới có quyền thực hiện',
  })
  @Patch(':id/role')
  @Roles(UserRole.OWNER)
  @ApiParam({
    name: 'id',
    description: 'Id của nhân viên',
  })
  @ApiBody({
    type: UpdateEmployeeRoleDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    example: {
      id: '7a3ef648-3a4d-497d-80c0-68c38a148015',
      email: 'ngocanhsedev2005@gmail.com',
      username: 'nunth200508)HUvl',
      isActive: true,
      isFirstLogin: true,
      role: 'STAFF',
      fullName: 'ADC',
      address: 'abcdef',
      phoneNumber: '0393878912',
      birthDate: '2005-08-20T00:00:00.000Z',
      avatarUrl: null,
      createdAt: '2025-11-22T08:22:17.559Z',
      updatedAt: '2025-11-22T11:08:46.770Z',
    },
  })
  async updateEmployeeRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEmployeeRoleDto: UpdateEmployeeRoleDto,
    @BookStoreId() bookStoreId: string,
  ) {
    return this.employeeService.updateEmployeeRole(
      id,
      updateEmployeeRoleDto,
      bookStoreId,
    );
  }
}
