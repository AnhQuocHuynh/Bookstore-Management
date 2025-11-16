import { UserSession } from '@/common/decorators';
import { TUserSession } from '@/common/utils/types';
import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  async getMe(@UserSession() userSession: TUserSession) {
    return this.userService.getMe(userSession);
  }
}
