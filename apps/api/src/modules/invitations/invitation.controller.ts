import { Public, Roles, UserSession } from '@/common/decorators';
import { TUserSession } from '@/common/utils/types';
import {
  AcceptInvitationDto,
  CreateInvitationDto,
  VerifyInvitationQueryDto,
} from '@/modules/invitations/dto';
import { UserRole } from '@/modules/users/enums';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
} from '@nestjs/common';
import { InvitationService } from './invitation.service';

@Controller('invitations')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @Post()
  async createInvitation(
    @Body() createInvitationDto: CreateInvitationDto,
    @UserSession() userSession: TUserSession,
  ) {
    return this.invitationService.createInvitation(
      createInvitationDto,
      userSession,
    );
  }

  @Public()
  @Get('verify')
  async verifyInvitation(
    @Query() verifyInvitationQueryDto: VerifyInvitationQueryDto,
  ) {
    return this.invitationService.verifyInvitation(verifyInvitationQueryDto);
  }

  @Public()
  @Post('accept')
  async acceptInvitation(
    @Body() acceptInvitationDto: AcceptInvitationDto,
    @Headers('x-auth-code') authCode: string,
  ) {
    if (!authCode?.trim())
      throw new BadRequestException('Auth code is missing...');

    return this.invitationService.acceptInvitation(
      acceptInvitationDto,
      authCode,
    );
  }
}
