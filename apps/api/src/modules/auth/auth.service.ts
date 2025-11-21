import {
  AuthorizationCodeTypeEnum,
  EmailTemplateNameEnum,
  OtpTypeEnum,
} from '@/common/enums';
import {
  decryptPayload,
  encryptPayload,
  generateOtp,
  setCookie,
  verifyPassword,
} from '@/common/utils/helpers';
import { TUserSession } from '@/common/utils/types';
import { BookStore, Otp, User } from '@/database/main/entities';
import { MainAuthorizationCodeService } from '@/database/main/services/main-authorization-code.service';
import { MainBookStoreService } from '@/database/main/services/main-bookstore.service';
import { MainEmployeeMappingService } from '@/database/main/services/main-employee-mapping.service';
import { MainOtpService } from '@/database/main/services/main-otp.service';
import { MainRefreshTokenService } from '@/database/main/services/main-refresh-token.service';
import { MainUserService } from '@/database/main/services/main-user.service';
import { Employee, RT } from '@/database/tenant/entities';
import {
  ChangePasswordDto,
  ForgetPasswordDto,
  ResendOtpDto,
  ResetPasswordDto,
  SignInDto,
  SignInOfBookStoreDto,
  SignUpDto,
  VerifyOtpDto,
} from '@/modules/auth/dto';
import { EmailService } from '@/modules/email/email.service';
import { UserRole } from '@/modules/users/enums';
import { TenantService } from '@/tenants/tenant.service';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  GoneException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { addDays, addMinutes } from 'date-fns';
import { Response } from 'express';
import { omit } from 'lodash';
import { MoreThan, Repository } from 'typeorm';
@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly tenantService: TenantService,
    private readonly emailService: EmailService,
    private readonly mainUserService: MainUserService,
    private readonly mainBookStoreService: MainBookStoreService,
    private readonly mainOtpService: MainOtpService,
    private readonly mainAuthCodeService: MainAuthorizationCodeService,
    private readonly mainRefreshTokenService: MainRefreshTokenService,
    private readonly mainEmployeeMappingService: MainEmployeeMappingService,
  ) {}

  async signIn(signInDto: SignInDto, response: Response) {
    const { email, password, role } = signInDto;
    const user = await this.mainUserService.findUserByField('email', email);

    if (role === UserRole.CUSTOMER) {
      throw new ForbiddenException(
        'Customer is not allowed to perform this action.',
      );
    }

    if (role === UserRole.ADMIN) {
      if (!user || (user && !(await verifyPassword(password, user.password))))
        throw new UnauthorizedException('Invalid credentials.');

      const { accessToken, refreshToken } = await this.generateTokens(
        user.id,
        user.role,
      );

      this.assignRefreshTokenToCookie(response, refreshToken);

      return {
        accessToken,
        profile: omit(user, ['password']),
      };
    }

    const isOwner = role === UserRole.OWNER && user !== null;

    const payload = {
      role,
      email,
    };

    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('jwt_secret'),
      expiresIn: this.configService.get('jwt_expiration_time', '120s'),
    });

    return {
      token,
      data: isOwner
        ? await this.mainBookStoreService.getBookStoresOfUser(user.id)
        : await this.mainEmployeeMappingService.findBookStoresOfEmployee(email),
    };
  }

  async signInOfBookStore(
    signInOfBookStoreDto: SignInOfBookStoreDto,
    token: string,
    response: Response,
  ) {
    let isOwner = false;

    try {
      const payload = this.jwtService.verify<{ role: UserRole; email: string }>(
        token,
        {
          secret: this.configService.get('jwt_secret'),
        },
      );

      const isValidRole = [UserRole.EMPLOYEE, UserRole.OWNER].includes(
        payload.role,
      );
      const isValidEmail = payload.email === signInOfBookStoreDto.email;

      if (!isValidRole || !isValidEmail) {
        throw new UnauthorizedException('Invalid token.');
      }

      isOwner = payload.role === UserRole.OWNER;
    } catch {
      throw new GoneException('Invalid or expired token.');
    }

    const { email, password, bookStoreId } = signInOfBookStoreDto;
    let userId: string = '';
    let profile: any = null;
    let storeCode: string = '';

    if (isOwner) {
      const user = await this.mainUserService.findUserByField('email', email);
      if (!user || (user && !(await verifyPassword(password, user.password))))
        throw new UnauthorizedException('Invalid credentials.');

      const bookStore = await this.mainBookStoreService.findBookStoreByField(
        'id',
        bookStoreId,
        {
          user: true,
        },
      );

      if (bookStore?.user?.id !== user.id)
        throw new ForbiddenException('You are not an owner of this bookstore.');

      userId = user.id;
      profile = omit(user, ['password']);
      storeCode = bookStore.code;
    } else {
      const employeeMappings =
        await this.mainEmployeeMappingService.findBookStoresOfEmployee(email);

      const bookStores = employeeMappings.map((em) => em.bookstore);

      let seletecBookStore: BookStore | null = null;
      for (const bs of bookStores) {
        if (bs.id === bookStoreId) {
          seletecBookStore = bs;
        }
      }

      if (!seletecBookStore)
        throw new ForbiddenException(
          'You are not an employee of this bookstore.',
        );

      const dataSource = await this.tenantService.getTenantConnection({
        bookStoreId,
      });

      const employeeRepo = dataSource.getRepository(Employee);

      const employee = await employeeRepo.findOne({
        where: {
          email,
        },
      });

      if (!employee || !(await verifyPassword(password, employee.password))) {
        throw new UnauthorizedException('Invalid credentails.');
      }

      userId = employee.id;
      profile = omit(employee, ['password']);
      storeCode = seletecBookStore.code;
    }

    const { accessToken, refreshToken } = await this.generateTokens(
      userId,
      isOwner ? UserRole.OWNER : UserRole.EMPLOYEE,
      bookStoreId,
    );

    this.assignRefreshTokenToCookie(response, refreshToken);

    return {
      accessToken,
      profile,
      storeCode,
      bookStoreId,
    };
  }

  async signUp(signUpDto: SignUpDto) {
    const { email, password, fullName, createBookStoreDto, phoneNumber } =
      signUpDto;

    const existingEmail = await this.mainUserService.findUserByField(
      'email',
      email,
    );

    if (existingEmail)
      throw new ConflictException(`This email has been registered.`);

    await this.mainBookStoreService.checkDuplicateField(
      'name',
      createBookStoreDto.name,
      email,
      'tên',
    );

    await this.mainBookStoreService.checkDuplicateField(
      'phoneNumber',
      createBookStoreDto.phoneNumber,
      email,
      'số điện thoại',
    );

    const newUser = await this.mainUserService.createNewUser({
      email,
      password,
      fullName,
      phoneNumber,
    });

    const bookStoreData = await this.mainBookStoreService.createNewBookStore(
      createBookStoreDto,
      newUser.id,
    );

    await this.processVerifyEmail(
      newUser,
      bookStoreData ? bookStoreData : undefined,
    );

    return {
      message: `The OTP has been sent to your email.`,
    };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const { email, otp, type } = verifyOtpDto;
    const user = await this.mainUserService.findUserByField('email', email);

    if (!user)
      throw new NotFoundException(`This email has not been registered.`);

    if (user.role === UserRole.ADMIN)
      throw new BadRequestException(
        'The account you are using is an admin account, so OTP verification cannot be performed.',
      );

    if (user.isEmailVerified && type === OtpTypeEnum.SIGN_UP)
      throw new BadRequestException('Your account has been email-verified.');

    const existingRecords = await this.mainOtpService.findOtpsByUserIdAndType(
      user.id,
      type,
    );

    let validRecord: Otp | null = null;
    for (const record of existingRecords) {
      const decryptOtp = decryptPayload(record.otp, this.configService);
      if (
        typeof decryptOtp === 'string' &&
        decryptOtp === otp &&
        record.expiresAt.getTime() > new Date().getTime()
      ) {
        validRecord = record;
        break;
      }
    }

    if (!validRecord) throw new GoneException('OTP has expired or invalid.');

    let storeCode = '';
    if (
      type === OtpTypeEnum.SIGN_UP &&
      typeof validRecord?.metadata?.bookStoreId === 'string'
    ) {
      const { bookStoreId } = validRecord.metadata;

      const bookStore = await this.mainBookStoreService.updateBookStore(
        {
          isActive: true,
        },
        bookStoreId,
      );

      if (bookStore) {
        storeCode = bookStore.code;
      }

      if (type === OtpTypeEnum.SIGN_UP && bookStore) {
        await this.emailService.handleSendEmail(
          user.email,
          EmailTemplateNameEnum.EMAIL_STORE_REGISTRATION,
          {
            ownerName: user.fullName,
            storeName: bookStore.name,
            storecode: bookStore.code,
            address: bookStore.address,
            phoneNumber: bookStore.phoneNumber,
            dashboardUrl: '',
          },
        );
      }
    }

    if (type === OtpTypeEnum.SIGN_UP) {
      await this.mainUserService.updateUser(
        {
          isActive: true,
          isEmailVerified: true,
        },
        user.id,
      );
    }

    let authCode: string = '';

    if (type === OtpTypeEnum.RESET_PASSWORD) {
      const expiresAt = addMinutes(new Date(), 10);
      const data = await this.mainAuthCodeService.createNewAuthozationCode(
        expiresAt,
        AuthorizationCodeTypeEnum.RESET_PASSWORD,
        user.id,
      );
      authCode = data.authCode;
    }

    await Promise.all(
      existingRecords.map((er) => this.mainOtpService.deleteOtpById(er.id)),
    );

    return {
      message:
        type === OtpTypeEnum.SIGN_UP
          ? 'Your account has been verified successfully. Registration completed.'
          : `OTP has been verified successfully.`,
      ...(authCode?.trim() && { authCode }),
      ...(type === OtpTypeEnum.SIGN_UP &&
        storeCode?.trim() && {
          bookStoreId: validRecord?.metadata?.bookStoreId ?? '',
          storeCode,
        }),
    };
  }

  async signOut(userSession: TUserSession, refreshToken: string) {
    const { userId, bookStoreId, role } = userSession;

    const user = await this.mainUserService.findUserByField('id', userId);
    if (!user) throw new NotFoundException('User not found.');

    if (user.role !== UserRole.ADMIN && !bookStoreId?.trim())
      throw new BadRequestException('Please provide bookstoreId to log out.');

    if (user.role === UserRole.ADMIN && bookStoreId?.trim()) {
      throw new BadRequestException(
        'Admin accounts should not include bookstoreId when logging out.',
      );
    }

    await this.revokeRefreshToken(user.id, role, refreshToken, bookStoreId);
    return {
      message: 'Signed out successfully.',
    };
  }

  async refreshToken(userSession: TUserSession, response: Response) {
    const { userId, role, bookStoreId } = userSession;

    if (role === UserRole.EMPLOYEE && !bookStoreId?.trim())
      throw new BadRequestException(
        'Please provide a bookstoreId for employee accounts.',
      );

    if (role === UserRole.ADMIN || role === UserRole.OWNER) {
      const user = await this.mainUserService.findUserByField('id', userId);
      if (!user) throw new NotFoundException('User not found.');
      const { accessToken, refreshToken } = await this.generateTokens(
        user.id,
        user.role,
      );
      this.assignRefreshTokenToCookie(response, refreshToken);
      return {
        accessToken,
      };
    }

    if (!userSession?.bookStoreId?.trim())
      throw new UnauthorizedException('Bookstore ID is missing...');

    const { accessToken, refreshToken } = await this.generateTokens(
      userSession.userId,
      userSession.role,
      userSession.bookStoreId,
    );

    this.assignRefreshTokenToCookie(response, refreshToken);

    return {
      accessToken,
    };
  }

  private async revokeRefreshToken(
    userId: string,
    role: UserRole,
    refreshToken: string,
    bookStoreId?: string,
  ) {
    if (!bookStoreId?.trim() || role === UserRole.OWNER) {
      const existingRecord =
        await this.mainRefreshTokenService.findValidRefreshTokenByUserIdAndToken(
          userId,
          refreshToken,
        );

      if (!existingRecord)
        throw new UnauthorizedException('You have already logged out.');

      await this.mainRefreshTokenService.updateRefreshToken(existingRecord.id, {
        isRevoked: true,
      });
    } else {
      const dataSource = await this.tenantService.getTenantConnection({
        bookStoreId,
      });

      const refreshTokenRepo = dataSource.getRepository(RT);

      const refreshTokens = await refreshTokenRepo.find({
        where: {
          emplee: {
            id: userId,
          },
          expiresAt: MoreThan(new Date()),
        },
      });

      for (const rt of refreshTokens) {
        const decryptToken = decryptPayload(rt.token, this.configService);
        if (typeof decryptToken === 'string' && decryptToken === refreshToken) {
          rt.isRevoked = true;
          refreshTokenRepo.save(rt);
          return;
        }
      }

      throw new UnauthorizedException('You have already logged out.');
    }
  }

  private async generateTokens(
    userId: string,
    role: UserRole,
    bookStoreId?: string,
  ) {
    const payload = {
      userId,
      role,
      ...(bookStoreId?.trim() && { bookStoreId }),
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt_secret'),
      expiresIn: this.configService.get('jwt_expiration_time', '120s'),
    });

    let refreshToken: string = '';
    if (!bookStoreId?.trim() || role === UserRole.OWNER) {
      const data =
        await this.mainRefreshTokenService.createNewRefreshToken(payload);
      refreshToken = data.refreshToken;
    } else {
      const dataSource = await this.tenantService.getTenantConnection({
        bookStoreId,
      });
      const repo = dataSource.getRepository(RT);
      const expiresAt = addDays(new Date(), 7);
      const refreshTokenString = this.jwtService.sign(payload, {
        secret: this.configService.get<string>('jwt_refresh_secret'),
        expiresIn: this.configService.get('jwt_refresh_expiration_time', '7d'),
      });
      await this.createNewRefreshToken(
        userId,
        expiresAt,
        refreshTokenString,
        repo,
      );
      refreshToken = refreshTokenString;
    }

    return {
      accessToken,
      refreshToken,
    };
  }

  public assignRefreshTokenToCookie(res: Response, refreshToken: string) {
    setCookie(
      res,
      'refreshToken',
      refreshToken,
      7 * 24 * 60 * 60 * 1000,
      this.configService,
      { httpOnly: true },
    );
  }

  public assignStoreCodeToCookie(res: Response, storeCode: string) {
    setCookie(
      res,
      'storeCode',
      storeCode,
      7 * 24 * 60 * 60 * 1000,
      this.configService,
      { httpOnly: false },
    );
  }

  private async createNewRefreshToken(
    userId: string,
    expiresAt: Date,
    token: string,
    repo: Repository<RT>,
  ) {
    const newRT = repo.create({
      token: encryptPayload(token, this.configService),
      emplee: {
        id: userId,
      },
      expiresAt,
    });
    await repo.save(newRT);
  }

  private async processVerifyEmail(user: User, bookStoreData?: BookStore) {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000);
    const metadata = bookStoreData
      ? { bookStoreId: bookStoreData.id }
      : undefined;
    const { otp } = await this.mainOtpService.createNewOtp(
      6,
      user.id,
      expiresAt,
      OtpTypeEnum.SIGN_UP,
      metadata,
    );
    await this.emailService.handleSendEmail(
      user.email,
      EmailTemplateNameEnum.EMAIL_OTP_VERIFICATION,
      {
        otp,
      },
    );
  }

  async forgetPassword(forgetPasswordDto: ForgetPasswordDto) {
    const { email } = forgetPasswordDto;
    const user = await this.mainUserService.findUserByField('email', email);

    if (!user)
      throw new NotFoundException(`This email has not been registered.`);

    if (user.role !== UserRole.OWNER) {
      throw new ForbiddenException(
        'Only the bookstore owner can perform this action.',
      );
    }

    const validOtps = await this.mainOtpService.findOtpsByUserIdAndType(
      user.id,
      OtpTypeEnum.RESET_PASSWORD,
    );

    if (validOtps.length > 0)
      throw new UnauthorizedException('You still have an active OTP code.');

    const expiresAt = addMinutes(new Date(), 5);

    const { otp } = await this.mainOtpService.createNewOtp(
      6,
      user.id,
      expiresAt,
      OtpTypeEnum.RESET_PASSWORD,
    );

    await this.emailService.handleSendEmail(
      user.email,
      EmailTemplateNameEnum.EMAIL_RESET_PASSWORD,
      {
        otp,
      },
    );

    return {
      message: `An OTP code has been sent to your email.`,
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { email, newPassword, authCode } = resetPasswordDto;

    const user = await this.mainUserService.findUserByField('email', email);

    if (!user)
      throw new NotFoundException(`This email has not been registered.`);

    if (user.role !== UserRole.OWNER) {
      throw new ForbiddenException(
        'Only the bookstore owner can perform this action.',
      );
    }

    const isValidAuthCode = await this.mainAuthCodeService.checkIsValidAuthCode(
      authCode,
      user.id,
      AuthorizationCodeTypeEnum.RESET_PASSWORD,
    );

    if (!isValidAuthCode)
      throw new GoneException('Invalid or expired auth code.');

    await this.mainUserService.updatePasswordOfUser(user.id, newPassword);
    await this.mainAuthCodeService.deleteAuthCodeByCode(
      decryptPayload(authCode, this.configService),
      user.id,
    );

    return {
      message: `Password updated successfully.`,
    };
  }

  async resendOtp(resendOtpDto: ResendOtpDto) {
    const { email, type } = resendOtpDto;

    const user = await this.mainUserService.findUserByField('email', email);

    if (!user)
      throw new NotFoundException(`This email has not been registered.`);

    if (user.role !== UserRole.OWNER) {
      throw new ForbiddenException(
        'Only the bookstore owner can perform this action.',
      );
    }

    const validOtps = await this.mainOtpService.findOtpsByUserIdAndType(
      user.id,
      type,
    );

    if (validOtps.length > 0) {
      const decryptOtp = decryptPayload(validOtps[0].otp, this.configService);
      await this.emailService.handleSendEmail(
        email,
        type === OtpTypeEnum.RESET_PASSWORD
          ? EmailTemplateNameEnum.EMAIL_RESET_PASSWORD
          : EmailTemplateNameEnum.EMAIL_OTP_VERIFICATION,
        {
          otp: decryptOtp,
        },
      );
    } else {
      let bookStoreId: string = '';

      if (type === OtpTypeEnum.SIGN_UP) {
        const bookStores = await this.mainBookStoreService.getBookStoresOfUser(
          user.id,
          {
            createdAt: 'desc',
          },
        );

        for (const bs of bookStores) {
          if (!bs.isActive) {
            bookStoreId = bs.id;
            break;
          }
        }
      }

      const expiresAt = addMinutes(new Date(), 5);
      const metadata = bookStoreId?.trim() ? { bookStoreId } : {};
      const { otp } = await this.mainOtpService.createNewOtp(
        6,
        user.id,
        expiresAt,
        type,
        metadata,
      );

      await this.emailService.handleSendEmail(
        email,
        type === OtpTypeEnum.RESET_PASSWORD
          ? EmailTemplateNameEnum.EMAIL_RESET_PASSWORD
          : EmailTemplateNameEnum.EMAIL_OTP_VERIFICATION,
        {
          otp,
        },
      );
    }

    return {
      message: `An OTP has been sent to your email.`,
    };
  }

  private async issueOtp(
    length = 6,
    userId: string,
    type: OtpTypeEnum,
    expiresAt: Date,
    repo: Repository<Otp>,
    metadata?: Record<string, any>,
  ) {
    const otp = generateOtp(length);
    const otpRecord = repo.create({
      otp: encryptPayload(otp, this.configService),
      user: {
        id: userId,
      },
      type,
      expiresAt,
      ...(metadata && {
        metadata,
      }),
    });
    await repo.save(otpRecord);
    return {
      otp,
    };
  }

  async changePassword(
    changePasswordDto: ChangePasswordDto,
    userSession: TUserSession,
  ) {
    const { userId, role } = userSession;
    const { otp, newPassword, currentPassword } = changePasswordDto;

    if (role !== UserRole.OWNER) {
      throw new ForbiddenException(
        'Only the bookstore owner can perform this action.',
      );
    }

    const user = await this.mainUserService.findUserByField('id', userId);

    if (!user)
      throw new NotFoundException(`This email has not been registered.`);

    const isValidPassword = await verifyPassword(
      currentPassword,
      user.password,
    );

    if (!isValidPassword)
      throw new BadRequestException('Mật khẩu hiện tại không đúng.');

    const otps = await this.mainOtpService.findOtpsByUserIdAndType(
      userId,
      OtpTypeEnum.CHANGE_PASSWORD,
    );

    let isValidOtp = false;

    for (const record of otps) {
      const decryptOtp = decryptPayload(record.otp, this.configService);
      if (
        typeof decryptOtp === 'string' &&
        decryptOtp === otp &&
        record.expiresAt.getTime() > new Date().getTime()
      ) {
        isValidOtp = true;
        break;
      }
    }

    if (!isValidOtp)
      throw new GoneException('Mã OTP không hợp lệ hoặc đã hết hạn.');

    await this.mainUserService.updatePasswordOfUser(userId, newPassword);

    return {
      message: `Mật khẩu của bạn đã được cập nhật.`,
    };
  }

  async requestChangePasswordOtp(userSession: TUserSession) {
    const { userId, bookStoreId, role } = userSession;

    if (!bookStoreId?.trim())
      throw new BadRequestException('Vui lòng cung cấp mã cửa hàng.');

    if (role !== UserRole.OWNER) {
      throw new ForbiddenException(
        'Only the bookstore owner can perform this action.',
      );
    }

    const bookStore = await this.mainBookStoreService.findBookStoreByField(
      'id',
      bookStoreId,
    );

    if (!bookStore) {
      throw new NotFoundException(
        `Bookstore with id ${bookStoreId} does not existed.`,
      );
    }

    const user = await this.mainUserService.findUserByField('id', userId);

    if (!user) throw new NotFoundException('Không tìm thấy thông tin của bạn.');

    const validOtps = await this.mainOtpService.findOtpsByUserIdAndType(
      user.id,
      OtpTypeEnum.CHANGE_PASSWORD,
    );

    let otp: string = '';

    if (validOtps.length > 0) {
      otp = encryptPayload(validOtps[0].otp, this.configService);
    } else {
      const data = await this.mainOtpService.createNewOtp(
        6,
        user.id,
        addMinutes(new Date(), 15),
        OtpTypeEnum.CHANGE_PASSWORD,
      );

      otp = data.otp;
    }

    await this.emailService.handleSendEmail(
      user.email,
      EmailTemplateNameEnum.EMAIL_REQUEST_CHANGE_PASSWORD_OTP,
      {
        otp,
        bookStoreName: bookStore.name,
      },
    );

    return {
      message: 'Mã OTP đã được gửi đến email của bạn.',
    };
  }
}
