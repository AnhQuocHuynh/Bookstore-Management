import { Module } from '@nestjs/common';
import { InvitationController } from './invitation.controller';
import { InvitationService } from './invitation.service';

@Module({
  providers: [InvitationService],
  controllers: [InvitationController],
})
export class InvitationModule {}
