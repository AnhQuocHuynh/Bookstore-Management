import { EmailModule } from '@/modules/email/email.module';
import { EmailService } from '@/modules/email/email.service';
import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { NotificationsModule } from '@/modules/notifications/notifications.module';
import { NotificationsService } from '@/modules/notifications/notifications.service';

@Module({
  imports: [EmailModule, NotificationsModule],
  controllers: [UserController],
  providers: [UserService, EmailService, NotificationsService],
  exports: [UserService],
})
export class UserModule {}
