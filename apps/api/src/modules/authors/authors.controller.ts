import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { Roles, UserSession } from '@/common/decorators';
import { UserRole } from '@/modules/users/enums';
import { CreateAuthorDto } from '@/common/dtos';
import { TUserSession } from '@/common/utils';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@Controller('authors')
@Roles(UserRole.OWNER)
@ApiBearerAuth()
@ApiTags('Tác giả')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @ApiOperation({
    summary: 'Tạo mới tác giả',
    description: 'Đường dẫn này dùng để tạo mới tác giả.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    example: {
      message: 'Thông tin tác giả được tạo thành công.',
      data: {
        id: 'aa797b82-d72d-4d72-bc47-815d81a6384c',
        fullName: 'Lê Ngọc Anh',
        penName: 'AnhLN',
        email: 'ngocanhln123@gmail.com',
        phone: '+84393873631',
        nationality: 'Việt Nam',
        bio: 'Một kỹ sư phần mềm',
        status: 'active',
        createdAt: '2025-12-09T06:16:28.477Z',
        updatedAt: '2025-12-09T06:16:28.477Z',
      },
    },
  })
  @ApiBody({
    type: CreateAuthorDto,
  })
  @Post()
  async createAuthor(
    @Body() createAuthorDto: CreateAuthorDto,
    @UserSession() userSession: TUserSession,
  ) {
    return this.authorsService.createAuthor(createAuthorDto, userSession);
  }
}
