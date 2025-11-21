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
  Post,
  Query,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('sign-in')
  async signIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.signIn(signInDto, response);
  }

  @Public()
  @Post('sign-in/employee')
  async signInOfEmployee(@Body() signInOfEmployeeDto: SignInOfEmployeeDto) {
    return this.authService.signInOfEmployee(signInOfEmployeeDto);
  }

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

  @Public()
  @Post('sign-up')
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Public()
  @Post('verify-otp')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(verifyOtpDto);
  }

  @Delete('sign-out')
  async signOut(
    @UserSession() userSession: TUserSession,
    @RefreshToken() token: string | null,
  ) {
    if (!token) throw new UnauthorizedException('Invalid refresh token.');
    return this.authService.signOut(userSession, token);
  }

  @Public()
  @UseGuards(RtGuard)
  @Post('refresh-token')
  async refreshToken(
    @UserSession() userSession: TUserSession,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.refreshToken(userSession, response);
  }

  @Public()
  @Post('forget-password')
  async forgetPassword(@Body() forgetPasswordDto: ForgetPasswordDto) {
    return this.authService.forgetPassword(forgetPasswordDto);
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Public()
  @Post('resend-otp')
  async resendOtp(@Body() resendOtpDto: ResendOtpDto) {
    return this.authService.resendOtp(resendOtpDto);
  }

  @Post('change-password')
  @Roles(UserRole.OWNER)
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @UserSession() userSession: TUserSession,
  ) {
    return this.authService.changePassword(changePasswordDto, userSession);
  }

  @Post('change-password/request-otp')
  @Roles(UserRole.OWNER)
  async requestChangePasswordOtp(@UserSession() userSession: TUserSession) {
    return this.authService.requestChangePasswordOtp(userSession);
  }
}
