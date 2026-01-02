import { JwtStrategy, RtStrategy } from '@/modules/auth/strategies';
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { NotificationsModule } from '@/modules/notifications/notifications.module';
import { NotificationsService } from '@/modules/notifications/notifications.service';

@Module({
  imports: [NotificationsModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RtStrategy, NotificationsService],
})
export class AuthModule {}
