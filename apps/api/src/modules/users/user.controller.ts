import { Public, Roles, UserSession } from '@/common/decorators';
import { TUserSession } from '@/common/utils/types';
import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRole } from '@/modules/users/enums';
import {
  CreateEmployeeByOwnerDto,
  UpdateOwnPasswordDto,
} from '@/modules/users/dto';

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

  @Patch('me/password')
  @Public()
  async updateOwnPassword(@Body() updateOwnPasswordDto: UpdateOwnPasswordDto) {
    return this.userService.updateOwnPassword(updateOwnPasswordDto);
  }
}
