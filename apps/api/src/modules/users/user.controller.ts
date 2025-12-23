import { Public, Roles, UserSession } from '@/common/decorators';
import { TUserSession } from '@/common/utils/types';
import { Body, Controller, Get, HttpStatus, Patch, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRole } from '@/modules/users/enums';
import {
  CreateEmployeeByOwnerDto,
  UpdateOwnPasswordDto,
  UpdateProfileDto,
} from '@/modules/users/dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@Controller('users')
@ApiTags('Người dùng')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({
    summary: 'Lấy thông tin cá nhân hiện tại',
    description:
      'Đường dẫn này dùng để lấy thông tin cá nhân hiện tại dựa trên token.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    examples: {
      th1: {
        summary: 'Nếu là chủ nhà sách',
        value: {
          id: 'fa069344-1227-4a18-a111-d639940e9ac8',
          email: 'lengocanhpyne363@gmail.com',
          fullName: 'ABC',
          phoneNumber: '0393173631',
          avatarUrl: null,
          birthDate: '2025-11-22T09:41:22.031Z',
          address: 'abc',
          isActive: true,
          isEmailVerified: true,
          role: 'OWNER',
          createdAt: '2025-11-19T18:36:47.531Z',
          updatedAt: '2025-11-22T09:42:38.128Z',
        },
      },
      th2: {
        summary: 'Nếu là quản trị viên',
        value: {
          id: '105c9484-780d-4dce-9db2-f8d96f303727',
          email: 'Diana_Ernser@gmail.com',
          fullName: 'Alice Jast',
          phoneNumber: '+15866929082',
          avatarUrl: null,
          birthDate: '2025-11-22T09:41:22.031Z',
          address: 'abc',
          isActive: true,
          isEmailVerified: true,
          role: 'ADMIN',
          createdAt: '2025-11-05T06:45:55.247Z',
          updatedAt: '2025-11-05T06:45:55.247Z',
        },
      },
      th3: {
        summary: 'Nếu là nhân viên nhà sách',
        value: {
          id: '947f7b62-6a70-4fc7-9fe0-2620d006b4c1',
          email: 'emberrestaurant94@gmail.com',
          username: 'tunv20050841sjAF',
          isActive: true,
          isFirstLogin: false,
          role: 'STAFF',
          fullName: 'Nguyễn Văn Tú',
          address: null,
          phoneNumber: '0393878913',
          birthDate: '2005-08-20T00:00:00.000Z',
          avatarUrl: null,
          createdAt: '2025-12-06T18:58:39.384Z',
          updatedAt: '2025-12-06T19:02:31.751Z',
        },
      },
    },
  })
  @ApiBearerAuth()
  @Roles(UserRole.EMPLOYEE, UserRole.OWNER, UserRole.ADMIN)
  @Get('me')
  async getMe(@UserSession() userSession: TUserSession) {
    return this.userService.getMe(userSession);
  }

  @ApiOperation({
    summary: 'Chủ nhà sách cấp tài khoản cho nhân viên',
    description:
      'Đường dẫn này dành cho chủ nhà sách cấp tài khoản cho nhân viên.',
  })
  @ApiBody({
    type: CreateEmployeeByOwnerDto,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    example: {
      message:
        'Tài khoản nhân viên đã được tạo. Một email chứa thông tin đăng nhập đã được gửi.',
    },
  })
  @ApiBearerAuth()
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

  @ApiOperation({
    summary: 'Nhân viên đổi mật khẩu khi đăng nhập lần đầu tiên',
    description:
      'Đường dẫn này dành cho nhân viên đổi mật khẩu khi họ đăng nhập lần đầu tiên.',
  })
  @ApiBody({
    type: UpdateOwnPasswordDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    example: {
      message: 'Mật khẩu đã được cập nhật thành công.',
    },
  })
  @Patch('me/password')
  @Public()
  async updateOwnPassword(@Body() updateOwnPasswordDto: UpdateOwnPasswordDto) {
    return this.userService.updateOwnPassword(updateOwnPasswordDto);
  }

  @ApiOperation({
    summary: 'Cập nhật thông tin hồ sơ',
    description: 'Đường dẫn này dùng để cập nhật thông tin hồ sơ cá nhân.',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    example: {
      message: 'Thông tin của bạn đã được cập nhật thành công.',
      data: {
        id: 'fa069344-1227-4a18-a111-d639940e9ac8',
        email: 'lengocanhpyne363@gmail.com',
        fullName: 'Ngọc Anh',
        phoneNumber: '0393173631',
        avatarUrl: null,
        birthDate: '2025-11-22T09:41:22.031Z',
        address: 'abc',
        isActive: true,
        isEmailVerified: true,
        role: 'OWNER',
        createdAt: '2025-11-19T18:36:47.531Z',
        updatedAt: '2025-12-09T06:40:07.186Z',
      },
    },
  })
  @ApiBody({
    type: UpdateProfileDto,
  })
  @Patch('me')
  @Roles(UserRole.EMPLOYEE, UserRole.OWNER)
  async updateProfile(
    @UserSession() userSession: TUserSession,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.userService.updateProfile(userSession, updateProfileDto);
  }
}
