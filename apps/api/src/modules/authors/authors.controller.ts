import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Get,
  Patch,
  Delete,
  Query,
  Param,
  ParseUUIDPipe
} from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { Roles, UserSession } from '@/common/decorators';
import { UserRole } from '@/modules/users/enums';
import {
  CreateAuthorDto,
  GetAuthorsQueryDto,
  UpdateAuthorDto
} from '@/common/dtos';
import { TUserSession } from '@/common/utils';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam
} from '@nestjs/swagger';

@Controller('authors')
@ApiBearerAuth()
@ApiTags('Tác giả')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) { }

  @ApiOperation({
    summary: 'Tạo mới tác giả',
    description: 'Chỉ OWNER mới có quyền thực hiện.',
  })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Tạo thành công' })
  @ApiBody({ type: CreateAuthorDto })
  @Post()
  @Roles(UserRole.OWNER)
  async createAuthor(
    @Body() createAuthorDto: CreateAuthorDto,
    @UserSession() userSession: TUserSession,
  ) {
    return this.authorsService.createAuthor(createAuthorDto, userSession);
  }

  // --- API MỚI ---

  @ApiOperation({
    summary: 'Lấy danh sách tác giả',
    description: 'Có thể lọc theo tên hoặc bút danh. Cho phép cả OWNER và EMPLOYEE.',
  })
  @Get()
  @Roles(UserRole.OWNER, UserRole.EMPLOYEE)
  async getAuthors(
    @Query() query: GetAuthorsQueryDto,
    @UserSession() userSession: TUserSession,
  ) {
    return this.authorsService.getAuthors(userSession, query);
  }

  @ApiOperation({
    summary: 'Cập nhật thông tin tác giả',
    description: 'Chỉ OWNER mới có quyền thực hiện.',
  })
  @ApiParam({ name: 'id', description: 'ID tác giả' })
  @ApiBody({ type: UpdateAuthorDto })
  @Patch(':id')
  @Roles(UserRole.OWNER)
  async updateAuthor(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAuthorDto: UpdateAuthorDto,
    @UserSession() userSession: TUserSession,
  ) {
    return this.authorsService.updateAuthor(id, updateAuthorDto, userSession);
  }

  @ApiOperation({
    summary: 'Xóa tác giả',
    description: 'Chỉ OWNER mới có quyền thực hiện. Cẩn thận: Có thể xóa các sách liên quan.',
  })
  @ApiParam({ name: 'id', description: 'ID tác giả' })
  @Delete(':id')
  @Roles(UserRole.OWNER)
  async deleteAuthor(
    @Param('id', ParseUUIDPipe) id: string,
    @UserSession() userSession: TUserSession,
  ) {
    return this.authorsService.deleteAuthor(id, userSession);
  }
}