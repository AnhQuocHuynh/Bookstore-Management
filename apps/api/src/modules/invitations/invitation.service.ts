import {
  AuthorizationCodeTypeEnum,
  EmailTemplateNameEnum,
  InvitationStatusEnum,
} from '@/common/enums';
import {
  generateSecureToken,
  hashPassword,
  hashTokenSHA256,
  verifyToken,
} from '@/common/utils/helpers';
import { TUserSession } from '@/common/utils/types';
import { MainBookStoreService } from '@/database/main/services/main-bookstore.service';
import { MainUserService } from '@/database/main/services/main-user.service';
import {
  AuthorizationCode,
  Employee,
  Invitation,
} from '@/database/tenant/entities';
import { User } from '@/database/tenant/entities/user.entity';
import { EmailService } from '@/modules/email/email.service';
import {
  CreateInvitationDto,
  VerifyInvitationQueryDto,
} from '@/modules/invitations/dto';
import { AcceptInvitationDto } from '@/modules/invitations/dto/accept-invitation.dto';
import { UserRole } from '@/modules/users/enums';
import { TenantService } from '@/tenants/tenant.service';
import {
  ConflictException,
  GoneException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { addMinutes } from 'date-fns';
import { MoreThan } from 'typeorm';

@Injectable()
export class InvitationService {
  constructor(
    private readonly emailService: EmailService,
    private readonly tenantService: TenantService,
    private readonly configService: ConfigService,
    private readonly mainUserService: MainUserService,
    private readonly mainBookStoreService: MainBookStoreService,
  ) {}

  async createInvitation(
    createInvitationDto: CreateInvitationDto,
    userSession: TUserSession,
  ) {
    const { email } = createInvitationDto;
    const { userId, bookStoreId } = userSession;

    if (!bookStoreId?.trim())
      throw new UnauthorizedException('BookstoreID is missing...');

    const user = await this.mainUserService.findUserByField('id', userId);
    if (!user) throw new NotFoundException('User not found.');

    const bookStoreData = await this.mainBookStoreService.findBookStoreByField(
      'id',
      bookStoreId,
    );

    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const employeeRepo = dataSource.getRepository(Employee);

    const existingEmployee = await employeeRepo.findOne({
      where: {
        user: {
          email,
        },
      },
      relations: {
        user: true,
      },
    });

    if (existingEmployee && existingEmployee.user.isActive)
      throw new ConflictException(
        'This email is already registered as an employee.',
      );

    const invitationRepo = dataSource.getRepository(Invitation);

    const existingCount = await invitationRepo.count({
      where: {
        email,
        expiresAt: MoreThan(new Date()),
      },
    });

    if (existingCount > 0)
      throw new ConflictException(
        'An active invitation has already been sent to this email.',
      );

    const token = generateSecureToken();
    const expiresAt = addMinutes(new Date(), 15);
    const newInvitation = invitationRepo.create({
      token: hashTokenSHA256(token),
      expiresAt,
      email,
    });
    await invitationRepo.save(newInvitation);

    const inviteLink = `${this.configService.get<string>('frontend_url', '')}/invite/accept?token=${token}&bookStoreId=${bookStoreData.id}`;

    await this.emailService.handleSendEmail(
      email,
      EmailTemplateNameEnum.EMAIL_INVITE_EMPLOYEE,
      {
        bookStoreName: bookStoreData.name,
        inviterName: user.fullName,
        inviterEmail: user.email,
        inviteLink,
      },
    );

    return {
      message: 'Invitation sent successfully.',
      invitation: {
        id: newInvitation.id,
        email: newInvitation.email,
        role: UserRole.EMPLOYEE,
        inviterId: user.id,
        inviterName: user.fullName,
        bookStoreId: bookStoreData.id,
        expiresAt: newInvitation.expiresAt,
      },
    };
  }

  async verifyInvitation(verifyInvitationQueryDto: VerifyInvitationQueryDto) {
    const { token, bookStoreId } = verifyInvitationQueryDto;

    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const invitationRepo = dataSource.getRepository(Invitation);
    const authorizationCodeRepo = dataSource.getRepository(AuthorizationCode);

    const invitations = await invitationRepo.find({
      where: {
        expiresAt: MoreThan(new Date()),
      },
    });

    let matchedInvitation: Invitation | null = null;

    for (const inv of invitations) {
      const isMatch = verifyToken(token, inv.token);
      if (isMatch) {
        matchedInvitation = inv;
        break;
      }
    }

    if (!matchedInvitation) {
      throw new UnauthorizedException('Invalid or expired invitation token.');
    }

    if (matchedInvitation.expiresAt.getTime() < new Date().getTime()) {
      throw new GoneException('This invitation has expired.');
    }

    await invitationRepo.update(
      {
        id: matchedInvitation.id,
      },
      {
        status: InvitationStatusEnum.ACCEPTED,
      },
    );

    const expiresAt = addMinutes(new Date(), 30);
    const authCode = generateSecureToken();
    const newAuthCode = authorizationCodeRepo.create({
      code: hashTokenSHA256(authCode),
      expiresAt,
      type: AuthorizationCodeTypeEnum.INVITE_EMPLOYEE,
    });
    await authorizationCodeRepo.save(newAuthCode);

    return {
      email: matchedInvitation.email,
      authCode,
      bookStoreId,
    };
  }

  async acceptInvitation(
    acceptInvitationDto: AcceptInvitationDto,
    authCode: string,
    bookStoreId: string,
  ) {
    const { email } = acceptInvitationDto;

    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const authCodeRepo = dataSource.getRepository(AuthorizationCode);
    const employeeRepo = dataSource.getRepository(Employee);
    const userTenantRepo = dataSource.getRepository(User);

    const authCodes = await authCodeRepo.find({
      where: {
        type: AuthorizationCodeTypeEnum.INVITE_EMPLOYEE,
      },
    });

    let matchedAuthCode: AuthorizationCode | null = null;

    for (const ac of authCodes) {
      const isMatch = verifyToken(authCode, ac.code);
      if (isMatch) {
        matchedAuthCode = ac;
        break;
      }
    }

    if (!matchedAuthCode) {
      throw new UnauthorizedException('Invalid or expired authorization code.');
    }

    if (matchedAuthCode.expiresAt.getTime() < new Date().getTime()) {
      throw new GoneException('This authorization code has expired.');
    }

    const existingEmployee = await employeeRepo.findOne({
      where: {
        user: {
          email,
        },
      },
      relations: {
        user: true,
      },
    });

    if (existingEmployee && existingEmployee.user.isActive)
      throw new ConflictException(`This email has been registered.`);

    const newUser = userTenantRepo.create({
      ...acceptInvitationDto,
      password: await hashPassword(acceptInvitationDto.password),
      role: UserRole.EMPLOYEE,
      isActive: true,
    });
    await userTenantRepo.save(newUser);

    const newEmployee = employeeRepo.create({
      isFirstLogin: false,
      user: {
        id: newUser.id,
      },
      userId: newUser.id,
    });
    await employeeRepo.save(newEmployee);

    return {
      message: 'Invitation accepted successfully.',
    };
  }
}
