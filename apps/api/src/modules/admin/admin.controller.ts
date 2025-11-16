import { Roles } from '@/common/decorators';
import { CreateDatabaseConnectionDto } from '@/modules/admin/dto';
import { UserRole } from '@/modules/users/enums';
import { Body, Controller, Post } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('database')
  async createDatabaseConnection(
    @Body() createDatabaseConnectionDto: CreateDatabaseConnectionDto,
  ) {
    return this.adminService.createDatabaseConnection(
      createDatabaseConnectionDto,
    );
  }
}
