import {
  AuthorizationCodeTypeEnum,
  EmailTemplateNameEnum,
  OtpTypeEnum,
} from '@/common/enums';
import {
  decryptPayload,
  encryptPayload,
  generateOtp,
  hashPassword,
  setCookie,
  verifyPassword,
} from '@/common/utils/helpers';
import { TUserSession } from '@/common/utils/types';
import { BookStore, User } from '@/database/main/entities';
import { MainAuthorizationCodeService } from '@/database/main/services/main-authorization-code.service';
import { MainBookStoreService } from '@/database/main/services/main-bookstore.service';
import { MainOtpService } from '@/database/main/services/main-otp.service';
import { MainRefreshTokenService } from '@/database/main/services/main-refresh-token.service';
import { MainUserService } from '@/database/main/services/main-user.service';
import {
  AuthorizationCode,
  Customer,
  Otp,
  RT,
} from '@/database/tenant/entities';
import { User as UserTenant } from '@/database/tenant/entities/user.entity';
import {
  ChangePasswordDto,
  ForgetPasswordDto,
  ResendOtpDto,
  ResetPasswordDto,
  SignInDto,
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
import { DataSource } from 'typeorm/browser';
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
  ) {}

  async signIn(signInDto: SignInDto, response: Response) {
    const { email, password, storeCode } = signInDto;
    const hasStoreCode = !!storeCode?.trim();

    const user = await this.mainUserService.findUserByField('email', email);

    if (user?.role !== UserRole.ADMIN && !storeCode?.trim())
      throw new BadRequestException(
        'Please provide the storeCode when logging in.',
      );

    if (user?.role === UserRole.ADMIN && storeCode?.trim()) {
      throw new BadRequestException(
        'Admin accounts should not provide a storeCode.',
      );
    }

    if (!hasStoreCode) {
      if (!user || !(await verifyPassword(password, user.password)))
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
    } else if (storeCode?.trim()) {
      const bookStoreData =
        await this.mainBookStoreService.findBookStoreByField(
          'code',
          storeCode,
          {
            user: true,
          },
        );

      if (!bookStoreData)
        throw new NotFoundException(
          `Book with code ${storeCode} does not existed.`,
        );

      if (user) {
        if (bookStoreData.user.id !== user.id) {
          throw new ForbiddenException(
            'You do not have permission to access this bookstore.',
          );
        }

        if (!user.isEmailVerified) {
          await this.processVerifyEmail(user, bookStoreData);
          return { message: 'The OTP has been sent to your email.' };
        }

        if (!(await verifyPassword(password, user.password)))
          throw new UnauthorizedException('Invalid credentials.');

        await this.tenantService.getTenantConnection({ storeCode });

        const { accessToken, refreshToken } = await this.generateTokens(
          user.id,
          user.role,
          bookStoreData.id,
        );

        this.assignRefreshTokenToCookie(response, refreshToken);
        this.assignStoreCodeToCookie(response, storeCode);

        return {
          accessToken,
          profile: omit(user, ['password']),
          storeCode,
          bookStoreId: bookStoreData.id,
        };
      }

      const connection = await this.tenantService.getTenantConnection({
        storeCode,
      });

      const userTenantRepo = connection.getRepository(UserTenant);
      const userTenant = await userTenantRepo.findOne({
        where: {
          email,
        },
        relations: {
          customer: true,
          employee: true,
        },
      });

      if (!userTenant || !(await verifyPassword(password, userTenant.password)))
        throw new UnauthorizedException('Invalid credentials.');

      if (
        !userTenant?.customer?.isEmailVerified &&
        userTenant?.role === UserRole.CUSTOMER
      ) {
        await this.processVerifyUserTenantEmail(userTenant, connection);
        return { message: 'The OTP has been sent to your email.' };
      }

      const { accessToken, refreshToken } = await this.generateTokens(
        userTenant.id,
        userTenant.role,
        bookStoreData.id,
      );

      this.assignRefreshTokenToCookie(response, refreshToken);
      this.assignStoreCodeToCookie(response, storeCode);

      return {
        accessToken,
        profile: omit(userTenant, [
          'password',
          'customer.userId',
          'customer.user',
        ]),
        storeCode,
        bookStoreId: bookStoreData.id,
      };
    }
  }

  async signUp(signUpDto: SignUpDto) {
    const {
      email,
      password,
      fullName,
      createBookStoreDto,
      role,
      bookStoreId,
      phoneNumber,
    } = signUpDto;

    if (role !== UserRole.OWNER && role !== UserRole.CUSTOMER)
      throw new BadRequestException('Role must be either OWNER or CUSTOMER');

    if (
      role === UserRole.CUSTOMER &&
      createBookStoreDto &&
      Object.keys(createBookStoreDto).length > 0
    )
      throw new BadRequestException(
        'Customers cannot create a bookstore during signup',
      );

    if (role === UserRole.OWNER && bookStoreId?.trim())
      throw new BadRequestException(
        'Owners cannot specify a bookstore ID during signup',
      );

    if (
      role === UserRole.OWNER &&
      createBookStoreDto &&
      Object.keys(createBookStoreDto).length > 0
    ) {
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
    } else if (role === UserRole.CUSTOMER && bookStoreId?.trim()) {
      const bookStoreData =
        await this.mainBookStoreService.findBookStoreByField('id', bookStoreId);

      if (!bookStoreData)
        throw new NotFoundException(
          `Bookstore with id ${bookStoreId} doés not existed.`,
        );

      const dataSource = await this.tenantService.getTenantConnection({
        bookStoreId: bookStoreData.id,
      });

      const userTenantRepo = dataSource.getRepository(UserTenant);
      const customerRepo = dataSource.getRepository(Customer);
      const otpRepo = dataSource.getRepository(Otp);

      const existing = await userTenantRepo.findOne({
        where: {
          email,
        },
        relations: {
          customer: true,
        },
      });

      if (
        (existing &&
          existing.isActive &&
          existing?.customer &&
          existing?.customer.isEmailVerified) ||
        bookStoreData.user.email === email
      ) {
        throw new ConflictException(`This email has been registered.`);
      }

      const newUserTenant = userTenantRepo.create({
        email,
        password: await hashPassword(password),
        isActive: false,
        fullName,
        role: UserRole.CUSTOMER,
        phoneNumber,
      });
      await userTenantRepo.save(newUserTenant);

      const newCustomer = customerRepo.create({
        user: newUserTenant,
        userId: newUserTenant.id,
      });
      await customerRepo.save(newCustomer);

      const { otp } = await this.issueOtp(
        6,
        newUserTenant.id,
        OtpTypeEnum.SIGN_UP,
        addMinutes(new Date(), 10),
        otpRepo,
      );

      await this.emailService.handleSendEmail(
        newUserTenant.email,
        EmailTemplateNameEnum.EMAIL_OTP_VERIFICATION,
        {
          otp,
        },
      );
    }

    return {
      message: `The OTP has been sent to your email.`,
    };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const { email, otp, type, bookStoreId } = verifyOtpDto;
    const user = await this.mainUserService.findUserByField('email', email);

    if (user?.role === UserRole.ADMIN)
      throw new BadRequestException(
        'The account you are using is an admin account, so OTP verification cannot be performed.',
      );

    if (user?.isEmailVerified && type === OtpTypeEnum.SIGN_UP)
      throw new BadRequestException('Your account has been email-verified.');

    if (!user && !bookStoreId?.trim())
      throw new BadRequestException(`Customer must provide a bookstoreId.`);

    if (user?.role === UserRole.OWNER && bookStoreId?.trim())
      throw new BadRequestException('Owner should not provide a bookstoreId.');

    if (user && !bookStoreId?.trim()) {
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
        throw new UnauthorizedException('OTP has expired or invalid.');

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
    } else if (!user && bookStoreId?.trim()) {
      const dataSource = await this.tenantService.getTenantConnection({
        bookStoreId,
      });

      const otpRepo = dataSource.getRepository(Otp);
      const userTenantRepo = dataSource.getRepository(UserTenant);
      const customerRepo = dataSource.getRepository(Customer);

      const customer = await customerRepo.findOne({
        where: {
          user: {
            email,
          },
        },
        relations: {
          user: true,
        },
      });

      if (!customer) throw new NotFoundException('Customer info not found.');

      if (customer.isEmailVerified && type === OtpTypeEnum.SIGN_UP)
        throw new ConflictException(`This email has been verified.`);

      const existingOtps = await otpRepo.find({
        where: {
          user: {
            id: customer.userId,
          },
          type,
        },
      });

      let isValid = false;

      for (const eo of existingOtps) {
        const decryptOtp = decryptPayload(eo.otp, this.configService);
        if (
          typeof decryptOtp === 'string' &&
          decryptOtp === otp &&
          eo.expiresAt.getTime() > new Date().getTime()
        ) {
          isValid = true;
          break;
        }
      }

      if (!isValid) throw new UnauthorizedException('Invalid or expired otp.');

      if (type === OtpTypeEnum.SIGN_UP) {
        customer.isEmailVerified = true;
        await customerRepo.save(customer);
        await userTenantRepo.update(
          {
            id: customer.userId,
          },
          {
            isActive: true,
          },
        );
      }

      let authCodeStr: string = '';

      if (type === OtpTypeEnum.RESET_PASSWORD) {
        const authorizationCodeRepo =
          dataSource.getRepository(AuthorizationCode);
        const expiresAt = addMinutes(new Date(), 5);
        const authCode = encryptPayload(
          crypto.randomUUID(),
          this.configService,
        );
        const newRecord = authorizationCodeRepo.create({
          code: await hashPassword(authCode),
          user: {
            id: customer.userId,
          },
          type: AuthorizationCodeTypeEnum.RESET_PASSWORD,
          expiresAt,
        });
        await authorizationCodeRepo.save(newRecord);
        authCodeStr = authCode;
      }

      await Promise.all(
        existingOtps.map((er) => otpRepo.delete({ id: er.id })),
      );

      return {
        message: `OTP has been verified successfully.`,
        ...(authCodeStr?.trim() && { authCode: authCodeStr }),
      };
    }
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

    if (
      (role === UserRole.EMPLOYEE || role === UserRole.CUSTOMER) &&
      !bookStoreId?.trim()
    )
      throw new BadRequestException(
        'Please provide a bookstoreId for employee or customer accounts.',
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

    const { accessToken, refreshToken } = await this.generateTokens(
      userSession.userId,
      userSession.role,
      userSession?.bookStoreId ? userSession.bookStoreId : undefined,
    );

    if (refreshToken?.trim())
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
          user: {
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
      user: {
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
    const { email, bookStoreId } = forgetPasswordDto;
    const user = await this.mainUserService.findUserByField('email', email);

    if (user?.role === UserRole.ADMIN && bookStoreId?.trim())
      throw new BadRequestException(
        'Admin accounts should not provide a bookstoreId when requesting a password reset.',
      );

    if (user?.role !== UserRole.ADMIN && !bookStoreId?.trim())
      throw new BadRequestException(
        'Please provide a bookstoreId when performing this action.',
      );

    if (!bookStoreId?.trim() || user?.role === UserRole.OWNER) {
      if (!user)
        throw new NotFoundException(`This email has not been registered.`);

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
    } else if (bookStoreId?.trim()) {
      const dataSource = await this.tenantService.getTenantConnection({
        bookStoreId,
      });

      const userTenantRepo = dataSource.getRepository(UserTenant);
      const findUser = await userTenantRepo.findOne({
        where: {
          email,
        },
      });

      if (!findUser)
        throw new NotFoundException(`This email has not been registered.`);

      const otpRepo = dataSource.getRepository(Otp);
      const otp = generateOtp();
      const expiresAt = addMinutes(new Date(), 5);
      const hashedOtp = encryptPayload(otp, this.configService);

      const newOtpRecord = otpRepo.create({
        otp: hashedOtp,
        expiresAt,
        user: {
          id: findUser.id,
        },
        type: OtpTypeEnum.RESET_PASSWORD,
      });
      await otpRepo.save(newOtpRecord);

      await this.emailService.handleSendEmail(
        findUser.email,
        EmailTemplateNameEnum.EMAIL_RESET_PASSWORD,
        {
          otp,
        },
      );
    }

    return {
      message: `An OTP code has been sent to your email.`,
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { email, newPassword, authCode, bookStoreId } = resetPasswordDto;

    const user = await this.mainUserService.findUserByField('email', email);

    if (
      (user?.role === UserRole.OWNER || user?.role === UserRole.ADMIN) &&
      bookStoreId?.trim()
    )
      throw new BadRequestException(
        'Admin and owner accounts should not provide a bookstoreId when requesting a password reset.',
      );

    if (!user && !bookStoreId?.trim())
      throw new BadRequestException(
        'Please provide a bookstoreId when performing this action.',
      );

    if (!bookStoreId?.trim()) {
      const user = await this.mainUserService.findUserByField('email', email);

      if (!user)
        throw new NotFoundException(`This email has not been registered.`);

      const isValidAuthCode =
        await this.mainAuthCodeService.checkIsValidAuthCode(
          authCode,
          user.id,
          AuthorizationCodeTypeEnum.RESET_PASSWORD,
        );

      if (!isValidAuthCode)
        throw new UnauthorizedException('Invalid or expired auth code.');

      await this.mainUserService.updatePasswordOfUser(user.id, newPassword);
      await this.mainAuthCodeService.deleteAuthCodeByCode(
        decryptPayload(authCode, this.configService),
        user.id,
      );
      return {
        message: `Password updated successfully.`,
      };
    } else {
      const dataSource = await this.tenantService.getTenantConnection({
        bookStoreId,
      });

      const authCodeRepo = dataSource.getRepository(AuthorizationCode);
      const userTenantRepo = dataSource.getRepository(UserTenant);
      const userTenant = await userTenantRepo.findOne({
        where: {
          email,
        },
      });

      if (!userTenant)
        throw new NotFoundException(`This email has not been registered.`);

      let isValidAuthCode = false;

      const authCodes = await authCodeRepo.find({
        where: {
          user: {
            id: userTenant.id,
          },
          expiresAt: MoreThan(new Date()),
          type: AuthorizationCodeTypeEnum.RESET_PASSWORD,
        },
      });

      for (const ac of authCodes) {
        if (
          (await verifyPassword(authCode, ac.code)) &&
          ac.expiresAt.getTime() > new Date().getTime()
        ) {
          isValidAuthCode = true;
          await authCodeRepo.delete({ id: ac.id });
          break;
        }
      }

      if (!isValidAuthCode)
        throw new GoneException('Invalid or expired auth code.');

      userTenant.password = await hashPassword(newPassword);
      if (userTenant?.employee) userTenant.employee.isFirstLogin = false;
      await userTenantRepo.save(userTenant);

      return {
        message: `Your password has been updated successfully.`,
      };
    }
  }

  async resendOtp(resendOtpDto: ResendOtpDto) {
    const { email, type, bookStoreId } = resendOtpDto;

    const user = await this.mainUserService.findUserByField('email', email);

    if (!user && !bookStoreId?.trim())
      throw new BadRequestException(
        'Please provide a bookstoreId when performing this action.',
      );

    if (
      (user?.role === UserRole.OWNER || user?.role === UserRole.ADMIN) &&
      bookStoreId?.trim() &&
      type !== OtpTypeEnum.SIGN_UP
    )
      throw new BadRequestException(
        'Admin and owner accounts should not provide a bookstoreId when requesting to resend OTP.',
      );

    if (user) {
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
        const expiresAt = addMinutes(new Date(), 5);
        const metadata = bookStoreId?.trim() ? { bookStoreId } : undefined;
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
    } else if (bookStoreId?.trim()) {
      const dataSource = await this.tenantService.getTenantConnection({
        bookStoreId,
      });

      const otpRepo = dataSource.getRepository(Otp);
      const userRepo = dataSource.getRepository(UserTenant);

      const userTenant = await userRepo.findOne({
        where: {
          email,
        },
      });

      if (!userTenant)
        throw new NotFoundException(`This email has not been registered.`);

      const validOtps = await otpRepo.find({
        where: {
          user: {
            id: userTenant.id,
          },
          type,
          expiresAt: MoreThan(new Date()),
        },
        order: {
          createdAt: 'desc',
        },
      });

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
        const expiresAt = addMinutes(new Date(), 5);
        const metadata = bookStoreId?.trim() ? { bookStoreId } : undefined;
        const otp = generateOtp();

        const otpRecord = otpRepo.create({
          otp: encryptPayload(otp, this.configService),
          user: {
            id: userTenant.id,
          },
          type,
          expiresAt,
          ...(metadata && {
            metadata,
          }),
        });
        await otpRepo.save(otpRecord);

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
    const { bookStoreId, userId, role } = userSession;
    const { otp, newPassword, currentPassword } = changePasswordDto;

    if (role === UserRole.OWNER) {
      const user = await this.mainUserService.findUserByField('id', userId);

      if (!user)
        throw new NotFoundException('Không tìm thấy thông tin của bạn.');

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

      const isValidPassword = await verifyPassword(
        currentPassword,
        user.password,
      );

      if (!isValidPassword)
        throw new BadRequestException('Mật khẩu hiện tại không đúng.');

      await this.mainUserService.updatePasswordOfUser(userId, newPassword);
    } else if (role === UserRole.EMPLOYEE) {
      const dataSource = await this.tenantService.getTenantConnection({
        bookStoreId,
      });

      const userTenant = dataSource.getRepository(UserTenant);
      const otpRepo = dataSource.getRepository(Otp);

      const user = await userTenant.findOne({
        where: {
          id: userId,
        },
      });

      if (!user || !user?.employee)
        throw new NotFoundException('Không tim thấy thông tin của bạn.');

      const otps = await otpRepo.find({
        where: {
          user: {
            id: userId,
          },
          type: OtpTypeEnum.CHANGE_PASSWORD,
        },
      });

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

      const isValidPassword = await verifyPassword(
        currentPassword,
        user.password,
      );

      if (!isValidPassword)
        throw new BadRequestException('Mật khẩu hiện tại không đúng.');

      user.password = await hashPassword(newPassword);
      await userTenant.save(user);
    }

    return {
      success: true,
      message: `Mật khẩu của bạn đã được cập nhật.`,
    };
  }

  async requestChangePasswordOtp(userSession: TUserSession) {
    const { userId, bookStoreId, role } = userSession;

    if (!bookStoreId?.trim())
      throw new BadRequestException('Vui lòng cung cấp mã cửa hàng.');

    if (role === UserRole.EMPLOYEE) {
      const bookStore = await this.mainBookStoreService.findBookStoreByField(
        'id',
        bookStoreId,
      );

      if (!bookStore) {
        throw new NotFoundException(
          `Bookstore with id ${bookStoreId} does not existed.`,
        );
      }

      const dataSource = await this.tenantService.getTenantConnection({
        bookStoreId,
      });

      const userTenant = dataSource.getRepository(UserTenant);
      const otpRepo = dataSource.getRepository(Otp);

      const user = await userTenant.findOne({
        where: {
          id: userId,
        },
        relations: {
          employee: true,
        },
      });

      if (!user || !user?.employee)
        throw new NotFoundException('Không tìm thấy thông tin của bạn.');

      const validOtps = await otpRepo.find({
        where: {
          user: {
            id: userId,
          },
          type: OtpTypeEnum.CHANGE_PASSWORD,
          expiresAt: MoreThan(new Date()),
        },
      });

      let otp: string = '';

      if (validOtps.length > 0) {
        otp = decryptPayload(validOtps[0].otp, this.configService);
      } else {
        otp = generateOtp();

        const newOtp = otpRepo.create({
          type: OtpTypeEnum.CHANGE_PASSWORD,
          otp: encryptPayload(otp, this.configService),
          expiresAt: addMinutes(new Date(), 15),
          user: {
            id: userId,
          },
        });
        await otpRepo.save(newOtp);

        await this.emailService.handleSendEmail(
          user.email,
          EmailTemplateNameEnum.EMAIL_REQUEST_CHANGE_PASSWORD_OTP,
          {
            otp,
            bookStoreName: bookStore.name,
          },
        );
      }
    } else if (role === UserRole.OWNER) {
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

      if (!user)
        throw new NotFoundException('Không tìm thấy thông tin của bạn.');

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
    }

    return {
      message: 'Mã OTP đã được gửi đến email của bạn.',
    };
  }

  async processVerifyUserTenantEmail(
    userTenant: UserTenant,
    dataSource: DataSource,
    metadata?: Record<string, any>,
  ) {
    const otpRepo = dataSource.getRepository(Otp);
    const otp = generateOtp(length);

    const otpRecord = otpRepo.create({
      otp: encryptPayload(otp, this.configService),
      user: {
        id: userTenant.id,
      },
      type: OtpTypeEnum.SIGN_UP,
      expiresAt: addMinutes(new Date(), 10),
      ...(metadata && {
        metadata,
      }),
    });

    await otpRepo.save(otpRecord);

    await this.emailService.handleSendEmail(
      userTenant.email,
      EmailTemplateNameEnum.EMAIL_OTP_VERIFICATION,
      {
        otp,
      },
    );
  }
}
