import { Body, Controller, Post } from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { Roles, UserSession } from '@/common/decorators';
import { UserRole } from '@/modules/users/enums';
import { CreateAuthorDto } from '@/common/dtos';
import { TUserSession } from '@/common/utils';

@Controller('authors')
@Roles(UserRole.OWNER)
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @Post()
  async createAuthor(
    @Body() createAuthorDto: CreateAuthorDto,
    @UserSession() userSession: TUserSession,
  ) {
    return this.authorsService.createAuthor(createAuthorDto, userSession);
  }
}
