import { Module } from '@nestjs/common';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { NotificationsModule } from '@/modules/notifications/notifications.module';
import { NotificationsService } from '@/modules/notifications/notifications.service';

@Module({
  imports: [NotificationsModule],
  controllers: [EmployeeController],
  providers: [EmployeeService, NotificationsService],
})
export class EmployeeModule {}
