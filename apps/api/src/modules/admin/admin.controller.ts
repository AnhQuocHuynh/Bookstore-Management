import { Roles } from '@/common/decorators';
import { CreateDatabaseConnectionDto } from '@/modules/admin/dto';
import { UserRole } from '@/modules/users/enums';
import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';

@Controller('admin')
@ApiTags('Quản trị viên')
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @ApiOperation({
    summary: 'Thêm mới database connection',
    description:
      'Đường dẫn này dùng cho quản trị viên để thêm mới một database connection vào hệ thống.',
  })
  @ApiBody({
    type: CreateDatabaseConnectionDto,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    example: {
      message: 'Đã tạo mới kết nối database thành công.',
      data: {
        id: '6012b8f6-cc55-4ad9-ae40-c76724bfbf34',
        host: 'aws-1-ap-northeast-2.pooler.supabase.com',
        port: 5432,
        username: 'postgres.jumixghwbgvudrqwhmqb',
        database: 'postgres',
        type: 'postgres',
        isConnected: false,
        lastConnectedAt: null,
        createdAt: '2025-12-09T06:00:20.076Z',
        updatedAt: '2025-12-09T06:00:20.076Z',
      },
    },
  })
  @Post('database')
  async createDatabaseConnection(
    @Body() createDatabaseConnectionDto: CreateDatabaseConnectionDto,
  ) {
    return this.adminService.createDatabaseConnection(
      createDatabaseConnectionDto,
    );
  }
}
