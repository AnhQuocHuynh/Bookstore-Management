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
  SignInOfEmployeeDto,
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
import { InjectDataSource } from '@nestjs/typeorm';
import { addDays, addMinutes } from 'date-fns';
import { Response } from 'express';
import { omit } from 'lodash';
import { DataSource, EntityManager, MoreThan, Repository } from 'typeorm';
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
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async signIn(signInDto: SignInDto, response: Response) {
    const { email, password } = signInDto;
    const user = await this.mainUserService.findUserByField('email', email);

    if (!user || (user && !(await verifyPassword(password, user.password))))
      throw new UnauthorizedException('Thông tin đăng nhập không chính xác.');

    if (user.role === UserRole.ADMIN) {
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

    const payload = {
      role: user.role,
      email,
    };

    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('jwt_secret'),
      expiresIn: '10m',
    });

    if (!user.isEmailVerified) {
      const bookstores = await this.mainBookStoreService.findBookStores({
        user,
        isActive: false,
      });

      await this.processVerifyEmail(
        user,
        bookstores?.length > 0
          ? (bookstores[0] as unknown as BookStore)
          : undefined,
      );
    }

    return {
      token,
      profile: omit(user, ['password']),
    };
  }

  async signInOfBookStore(
    signInOfBookStoreDto: SignInOfBookStoreDto,
    token: string,
    response: Response,
  ) {
    const { email, password, bookStoreId, username } = signInOfBookStoreDto;
    let isOwner = false;
    let payload: any = null;

    try {
      payload = this.jwtService.verify<{
        role: UserRole;
        email?: string;
        username?: string;
      }>(token, {
        secret: this.configService.get('jwt_secret'),
      });

      const isValidRole = [UserRole.EMPLOYEE, UserRole.OWNER].includes(
        payload.role,
      );

      if (!isValidRole) throw new Error('Token không hợp lệ hoặc đã hết hạn.');

      isOwner = payload.role === UserRole.OWNER;
    } catch (error) {
      throw new GoneException('Token không hợp lệ hoặc đã hết hạn.');
    }

    if (payload?.role === UserRole.OWNER && username?.trim())
      throw new BadRequestException(
        'Chủ nhà sách không nên cung cấp tên đăng nhập.',
      );

    if (payload?.role === UserRole.EMPLOYEE && email?.trim())
      throw new BadRequestException('Nhân viên không nên cung cấp email.');

    let userId: string = '';
    let profile: any = null;
    let storeCode: string = '';

    if (isOwner) {
      if (!email)
        throw new BadRequestException('Chủ nhà sách phải cung cấp email.');

      const user = await this.mainUserService.findUserByField('email', email);

      if (!user || (user && !(await verifyPassword(password, user.password))))
        throw new UnauthorizedException('Thông tin đăng nhập không chính xác.');

      const bookStore = await this.mainBookStoreService.findBookStoreByField(
        'id',
        bookStoreId,
        {
          user: true,
        },
      );

      if (bookStore?.user?.id !== user.id)
        throw new ForbiddenException('Bạn không phải là chủ của nhà sách này.');

      userId = user.id;
      profile = omit(user, ['password']);
      storeCode = bookStore.code;
    } else {
      if (!username?.trim())
        throw new BadRequestException('Nhân viên phải cung cấp tên đăng nhập.');

      const employeeMappings =
        await this.mainEmployeeMappingService.findBookStoresOfEmployee(
          username,
        );

      const bookStores = employeeMappings.map((em) => em.bookstore);
      let seletecBookStore: BookStore | null = null;

      for (const bs of bookStores) {
        if (bs.id === bookStoreId) {
          seletecBookStore = bs;
        }
      }

      if (!seletecBookStore)
        throw new ForbiddenException('Không tìm thấy thông tin nhà sách.');

      const dataSource = await this.tenantService.getTenantConnection({
        bookStoreId,
      });

      const employeeRepo = dataSource.getRepository(Employee);

      const employee = await employeeRepo.findOne({
        where: {
          username,
        },
      });

      if (
        !employee ||
        (employee && !(await verifyPassword(password, employee.password)))
      ) {
        throw new UnauthorizedException('Thông tin đăng nhập không chính xác.');
      }

      if (!employee.isActive) {
        throw new ForbiddenException(
          'Tài khoản của bạn đã bị khoá bởi chủ nhà sách này.',
        );
      }

      if (employee.isFirstLogin) {
        const token = await this.jwtService.signAsync({
          username: employee.username,
          bookStoreId,
        });

        return {
          token,
          message:
            'Chào mừng! Vì đây là lần đăng nhập đầu tiên của bạn, vui lòng thay đổi mật khẩu.',
          isFirstLogin: true,
          profile: omit(employee, ['password']),
        };
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

  async signInOfEmployee(signInOfEmployeeDto: SignInOfEmployeeDto) {
    const { username } = signInOfEmployeeDto;

    const employeeMappings =
      await this.mainEmployeeMappingService.findBookStoresOfEmployee(username);

    if (!employeeMappings.find((em) => em.username === username)) {
      throw new NotFoundException('Thông tin đăng nhập không chính xác.');
    }

    const payload = {
      role: UserRole.EMPLOYEE,
      username,
    };

    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('jwt_secret'),
      expiresIn: '10m',
    });

    return {
      token,
    };
  }

  async signUp(signUpDto: SignUpDto) {
    const {
      email,
      password,
      fullName,
      createBookStoreDto,
      phoneNumber,
      birthDate,
      address,
    } = signUpDto;

    return this.dataSource.transaction(async (manager) => {
      const userRepo = manager.getRepository(User);
      const bookStoreRepo = manager.getRepository(BookStore);

      const existingEmail = await this.mainUserService.findUserByField(
        'email',
        email,
        userRepo,
      );

      if (existingEmail)
        throw new ConflictException(`Email này đã được đăng ký.`);

      await this.mainBookStoreService.checkDuplicateField(
        'name',
        createBookStoreDto.name,
        email,
        'tên',
        bookStoreRepo,
      );

      await this.mainBookStoreService.checkDuplicateField(
        'phoneNumber',
        createBookStoreDto.phoneNumber,
        email,
        'số điện thoại',
        bookStoreRepo,
      );

      const newUser = await this.mainUserService.createNewUser(
        {
          email,
          password,
          fullName,
          phoneNumber,
          address,
          birthDate,
        },
        userRepo,
      );

      const bookStoreData = await this.mainBookStoreService.createNewBookStore(
        createBookStoreDto,
        newUser.id,
        manager,
      );

      await this.processVerifyEmail(
        newUser,
        bookStoreData ? bookStoreData : undefined,
        manager,
      );

      return {
        message:
          'Mã OTP xác thực tài khoản đã được gửi đến email của bạn. Vui lòng kiểm tra để hoàn tất đăng ký.',
      };
    });
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const { email, otp, type } = verifyOtpDto;
    const user = await this.mainUserService.findUserByField('email', email);

    if (!user)
      throw new NotFoundException(
        `Email này chưa được đăng ký trong hệ thống.`,
      );

    if (user.role === UserRole.ADMIN)
      throw new BadRequestException(
        'Tài khoản bạn đang sử dụng là tài khoản quản trị, nên không thể thực hiện xác thực OTP.',
      );

    if (user.isEmailVerified && type === OtpTypeEnum.SIGN_UP)
      throw new BadRequestException(
        'Email tài khoản của bạn đã được xác thực.',
      );

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

    if (!validRecord)
      throw new GoneException('Mã OTP đã hết hạn hoặc không hợp lệ.');

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
            ownerEmail: user.email,
            storeCode: bookStore.code,
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
          ? 'Tài khoản của bạn đã được xác thực thành công. Quá trình đăng ký đã hoàn tất.'
          : 'OTP đã được xác thực thành công.',
      ...(authCode?.trim() && { authCode }),
      ...(type === OtpTypeEnum.SIGN_UP &&
        storeCode?.trim() &&
        validRecord?.metadata?.bookStoreId?.trim() && {
          bookStoreId: validRecord?.metadata?.bookStoreId,
          storeCode,
        }),
    };
  }

  async signOut(userSession: TUserSession, refreshToken: string) {
    const { userId, bookStoreId, role } = userSession;

    const user = await this.mainUserService.findUserByField('id', userId);

    if (user?.role === UserRole.ADMIN && bookStoreId?.trim()) {
      throw new BadRequestException(
        'Tài khoản quản trị không nên bao gồm bookstoreId khi đăng xuất.',
      );
    }

    await this.revokeRefreshToken(userId, role, refreshToken, bookStoreId);
    return {
      message: 'Đăng xuất tài khoản thành công.',
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
          employee: {
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
      employee: {
        id: userId,
      },
      expiresAt,
    });
    await repo.save(newRT);
  }

  private async processVerifyEmail(
    user: User,
    bookStoreData?: BookStore,
    manager?: EntityManager,
  ) {
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
      manager,
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
      throw new NotFoundException(
        `Email của bạn chưa được đăng ký trong hệ thống.`,
      );

    if (user.role !== UserRole.OWNER) {
      throw new ForbiddenException(
        'Only the bookstore owner can perform this action.',
      );
    }

    const validOtps = await this.mainOtpService.findOtpsByUserIdAndType(
      user.id,
      OtpTypeEnum.RESET_PASSWORD,
    );

    let otpCode: string = '';

    if (validOtps.length > 0) {
      otpCode = decryptPayload(validOtps[0].otp, this.configService);
    } else {
      const expiresAt = addMinutes(new Date(), 5);

      const { otp } = await this.mainOtpService.createNewOtp(
        6,
        user.id,
        expiresAt,
        OtpTypeEnum.RESET_PASSWORD,
      );

      otpCode = otp;
    }

    await this.emailService.handleSendEmail(
      user.email,
      EmailTemplateNameEnum.EMAIL_RESET_PASSWORD,
      {
        otp: otpCode,
      },
    );

    return {
      message: 'Mã OTP đã được gửi đến email của bạn.',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { email, newPassword, authCode } = resetPasswordDto;

    const user = await this.mainUserService.findUserByField('email', email);

    if (!user)
      throw new NotFoundException(
        `Email của bạn chưa được đăng ký trong hệ thống.`,
      );

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
      throw new NotFoundException(
        `Email của bạn chưa được đăng ký trong hệ thống.`,
      );

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
      message: 'Mã OTP đã được gửi đến email của bạn.',
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
      throw new NotFoundException(
        `Email của bạn chưa được đăng ký trong hệ thống.`,
      );

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
