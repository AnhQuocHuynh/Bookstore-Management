import { Roles, UserSession } from '@/common/decorators';
import { TUserSession } from '@/common/utils/types';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRole } from '@/modules/users/enums';
import { CreateEmployeeByOwnerDto } from '@/modules/users/dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  async getMe(@UserSession() userSession: TUserSession) {
    return this.userService.getMe(userSession);
  }

  @Post('employees')
  @Roles(UserRole.OWNER)
  async createEmployeeByOwner(
    @UserSession() userSession: TUserSession,
    @Body() createEmployeeByOwnerDto: CreateEmployeeByOwnerDto,
  ) {
    return this.userService.createEmployeeByOwner(
      userSession,
      createEmployeeByOwnerDto,
    );
  }
}
