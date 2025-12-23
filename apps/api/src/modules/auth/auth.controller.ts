import { Public, RefreshToken, Roles, UserSession } from '@/common/decorators';
import { RtGuard } from '@/common/guards';
import { TUserSession } from '@/common/utils/types';
import {
  ChangePasswordDto,
  ForgetPasswordDto,
  ResendOtpDto,
  ResetPasswordDto,
  SignInDto,
  SignInOfBookStoreDto,
  SignInOfEmployeeDto,
  SignUpDto,
  VerifyOtpDto,
} from '@/modules/auth/dto';
import { UserRole } from '@/modules/users/enums';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  HttpStatus,
  Post,
  Query,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@Controller('auth')
@ApiTags('Xác thực')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary:
      'Đăng nhập vào hệ thống (đối với chủ nhà sách hoặc quản trị viên).',
    description:
      'Đường dẫn này dùng để thực hiện việc đăng nhập vào hệ thống (chỉ có chủ nhà sách hoặc quản trị viên mới thực hiện được).',
  })
  @ApiBody({
    type: SignInDto,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Dữ liệu trả về.',
    examples: {
      th1: {
        summary: 'Nếu là quản trị viên',
        value: {
          accessToken:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMDVjOTQ4NC03ODBkLTRkY2UtOWRiMi1mOGQ5NmYzMDM3MjciLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3NjUwNzA0OTUsImV4cCI6MTc2NTA3MTA5NX0.9Z1Q2nXeQyUiAJU0UtxYu4xs01lLMpv0lHWZlCjV7Ss',
          profile: {
            id: '105c9484-780d-4dce-9db2-f8d96f303727',
            email: 'Diana_Ernser@gmail.com',
            fullName: 'Alice Jast',
            phoneNumber: '+15866929082',
            logoUrl: null,
            birthDate: '2025-11-22T09:41:22.031Z',
            address: null,
            isActive: true,
            isEmailVerified: true,
            role: 'ADMIN',
            createdAt: '2025-11-05T06:45:55.247Z',
            updatedAt: '2025-11-05T06:45:55.247Z',
          },
        },
      },
      th2: {
        summary: 'Nếu là chủ nhà sách',
        value: {
          token:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiT1dORVIiLCJlbWFpbCI6ImxlbmdvY2FuaHB5bmUzNjNAZ21haWwuY29tIiwiaWF0IjoxNzY1MDcwOTAyLCJleHAiOjE3NjUwNzE1MDJ9.yAypqKC7KpubuMz0Lezxa5cywL9gmlJfOgavu7zavoM',
          profile: {
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
      },
    },
  })
  @Public()
  @Post('sign-in')
  async signIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.signIn(signInDto, response);
  }

  @ApiOperation({
    summary: 'Đăng nhập vào hệ thống (đối với nhân viên nhà sách).',
    description:
      'Đường dẫn này dùng để đăng nhập vào hệ thống, nhưng chỉ dành cho nhân viên nhà sách.',
  })
  @ApiBody({
    type: SignInOfEmployeeDto,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Dữ liệu trả về.',
    example: {
      token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiRU1QTE9ZRUUiLCJ1c2VybmFtZSI6Im51bnRoMjAwNTA4KUhVdmwiLCJpYXQiOjE3NjUwNzE2MDEsImV4cCI6MTc2NTA3MjIwMX0.Sh4E_TigQkbhsnLyWpuc46vEMMDjslSSASfVIMNyyX8',
    },
  })
  @Public()
  @Post('sign-in/employee')
  async signInOfEmployee(@Body() signInOfEmployeeDto: SignInOfEmployeeDto) {
    return this.authService.signInOfEmployee(signInOfEmployeeDto);
  }

  @ApiOperation({
    summary: 'Đăng nhập vào nhà sách',
    description:
      'Đường dẫn này dùng để đăng nhập vào nhà sách (sau bước đăng nhập vào hệ thống), chỉ có chủ nhà sách hoặc nhân viên nhà sách mới thực hiện được.',
  })
  @ApiBody({
    type: SignInOfBookStoreDto,
    description: 'Dữ liệu gửi đi.',
  })
  @ApiQuery({
    name: 'token',
    description:
      'Mã token dùng để xác thực người dùng, đảm bảo rằng chỉ đã thực hiện bước đăng nhập vào hệ thống rồi thì mới gọi được API này.',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiRU1QTE9ZRUUiLCJ1c2VybmFtZSI6Im51bnRoMjAwNTA4KUhVdmwiLCJpYXQiOjE3NjUwNzE2MDEsImV4cCI6MTc2NTA3MjIwMX0.Sh4E_TigQkbhsnLyWpuc46vEMMDjslSSASfVIMNyyX8',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Dữ liệu trả về.',
    examples: {
      th1: {
        summary: 'Nếu là chủ nhà sách',
        value: {
          accessToken:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmYTA2OTM0NC0xMjI3LTRhMTgtYTExMS1kNjM5OTQwZTlhYzgiLCJyb2xlIjoiT1dORVIiLCJib29rU3RvcmVJZCI6Ijk5YzMxZWNlLWY4MjQtNGEzNC1hOTY1LTQyMGM0Yzg2YjAzOSIsImlhdCI6MTc2NTA3MzA5MywiZXhwIjoxNzY1MDczNjkzfQ.Ceo_kpAhrjg_avXbmGjfvaE8RSRz6D7qN3s_ynt6ANQ',
          profile: {
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
          storeCode: 'NHASAC-F050',
          bookStoreId: '99c31ece-f824-4a34-a965-420c4c86b039',
        },
      },
      th2: {
        summary: 'Nếu là nhân viên nhà sách',
        value: {
          accessToken:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI5NDdmN2I2Mi02YTcwLTRmYzctOWZlMC0yNjIwZDAwNmI0YzEiLCJyb2xlIjoiRU1QTE9ZRUUiLCJib29rU3RvcmVJZCI6Ijk5YzMxZWNlLWY4MjQtNGEzNC1hOTY1LTQyMGM0Yzg2YjAzOSIsImlhdCI6MTc2NTA3MzAxMSwiZXhwIjoxNzY1MDczNjExfQ.YZ2VfZe0unaQJZjO_pqIQosqbgRrEfrUlZkx3sizjy0',
          profile: {
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
          storeCode: 'NHASAC-F050',
          bookStoreId: '99c31ece-f824-4a34-a965-420c4c86b039',
        },
      },
    },
  })
  @Public()
  @Post('sign-in/bookstore')
  async signInOfBookStore(
    @Body() signInOfBookStoreDto: SignInOfBookStoreDto,
    @Query('token') token: string,
    @Res({
      passthrough: true,
    })
    response: Response,
  ) {
    if (!token?.trim()) throw new BadRequestException('Token is missing...');
    return this.authService.signInOfBookStore(
      signInOfBookStoreDto,
      token,
      response,
    );
  }

  @ApiOperation({
    summary: 'Đăng ký',
    description:
      'Đường dẫn này dùng để đăng ký tài khoản mới (mặc định khi đăng ký sẽ là chủ nhà sách).',
  })
  @ApiBody({
    type: SignUpDto,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Dữ liệu trả về.',
    example: {
      message:
        'Mã OTP xác thực tài khoản đã được gửi đến email của bạn. Vui lòng kiểm tra để hoàn tất đăng ký.',
    },
  })
  @Public()
  @Post('sign-up')
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @ApiOperation({
    summary: 'Xác thực OTP',
    description: 'Đường dẫn này dùng để xác thực mã OTP.',
  })
  @ApiBody({
    type: VerifyOtpDto,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Dữ liệu trả về.',
    examples: {
      th1: {
        summary: 'Nếu là đăng ký',
        value: {
          message:
            'Tài khoản của bạn đã được xác thực thành công. Quá trình đăng ký đã hoàn tất.',
          bookStoreId: 'bookstore-id',
          storeCode: 'bookstore-code',
        },
      },
      th2: {
        summary: 'Nếu là reset password',
        value: {
          message: 'OTP đã được xác thực thành công.',
          authCode: 'auth-code',
        },
      },
      th3: {
        summary: 'Nếu là các trường hợp còn lại',
        value: {
          message: 'OTP đã được xác thực thành công.',
        },
      },
    },
  })
  @Public()
  @Post('verify-otp')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(verifyOtpDto);
  }

  @ApiOperation({
    summary: 'Đăng xuất',
    description:
      'Đường dẫn này dùng để đăng xuất tài khoản người dùng, dùng cho cả 3 vai trò.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    example: {
      message: 'Đăng xuất tài khoản thành công.',
    },
  })
  @ApiBearerAuth()
  @Delete('sign-out')
  async signOut(
    @UserSession() userSession: TUserSession,
    @RefreshToken() token: string | null,
  ) {
    if (!token) throw new UnauthorizedException('Invalid refresh token.');
    return this.authService.signOut(userSession, token);
  }

  @ApiOperation({
    summary: 'Làm mới access token',
    description: 'Đường dẫn này dùng để làm mới access token nếu nó hết hạn.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    example: {
      accessToken: 'new-acess-token',
    },
  })
  @Public()
  @UseGuards(RtGuard)
  @Post('refresh-token')
  async refreshToken(
    @UserSession() userSession: TUserSession,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.refreshToken(userSession, response);
  }

  @ApiOperation({
    summary: 'Quên mật khẩu',
    description:
      'Đường dẫn này dùng để lấy lại mật khẩu nếu như người dùng quên mật khẩu của họ, chỉ có CHỦ NHÀ SÁCH mới có quyền thực hiện hành động này.',
  })
  @ApiBody({
    type: ForgetPasswordDto,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    example: {
      message: 'Mã OTP đã được gửi đến email của bạn.',
    },
  })
  @Public()
  @Post('forget-password')
  async forgetPassword(@Body() forgetPasswordDto: ForgetPasswordDto) {
    return this.authService.forgetPassword(forgetPasswordDto);
  }

  @ApiOperation({
    summary: 'Đặt lại mật khẩu',
    description:
      'Đường dẫn này dùng để đặt lại mật khẩu người dùng, chỉ có CHỦ NHÀ SÁCH mới có quyền thực hiện hành động này.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    example: {},
  })
  @ApiBody({
    type: ResetPasswordDto,
  })
  @Public()
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @ApiOperation({
    summary: 'Gửi lại mã OTP',
    description:
      'Đường dẫn này dùng để gửi mã OTP nếu mã OTP hết hạn, chỉ có CHỦ NHÀ SÁCH mới có quyền thực hiện hành động này.',
  })
  @ApiBody({
    type: ResendOtpDto,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Dữ liệu trả về.',
    example: {
      message: 'Mã OTP đã được gửi đến email của bạn.',
    },
  })
  @Public()
  @Post('resend-otp')
  async resendOtp(@Body() resendOtpDto: ResendOtpDto) {
    return this.authService.resendOtp(resendOtpDto);
  }

  @ApiOperation({
    summary: 'Thay đổi mật khẩu',
    description:
      'Đường dẫn này dùng để thay đổi mật khẩu hiện tại, chỉ dành cho CHỦ NHÀ SÁCH đã đăng nhập vào nhà sách và muốn thay đổi mật khẩu.',
  })
  @ApiBearerAuth()
  @ApiBody({
    type: ChangePasswordDto,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    example: {
      message: `Mật khẩu của bạn đã được cập nhật.`,
    },
  })
  @Post('change-password')
  @Roles(UserRole.OWNER)
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @UserSession() userSession: TUserSession,
  ) {
    return this.authService.changePassword(changePasswordDto, userSession);
  }

  @ApiOperation({
    summary: 'Xác thực request trước khi yêu cầu thay đổi mật khẩu',
    description:
      'Đường dẫn này dùng để xác thực request trước khi yêu cầu thay đổi mật khẩu, chỉ có CHỦ NHÀ SÁCH mới có quyền thực hiện hành động này.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    example: {
      message: 'Mã OTP đã được gửi đến email của bạn.',
    },
  })
  @ApiBearerAuth()
  @Post('change-password/request-otp')
  @Roles(UserRole.OWNER)
  async requestChangePasswordOtp(@UserSession() userSession: TUserSession) {
    return this.authService.requestChangePasswordOtp(userSession);
  }
}
