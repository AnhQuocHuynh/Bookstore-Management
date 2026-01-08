import { Module } from '@nestjs/common';
import { ReturnOrdersController } from './return-orders.controller';
import { ReturnOrdersService } from './return-orders.service';
import { NotificationsModule } from '@/modules/notifications/notifications.module';
import { NotificationsService } from '@/modules/notifications/notifications.service';

@Module({
  imports: [NotificationsModule],
  controllers: [ReturnOrdersController],
  providers: [ReturnOrdersService, NotificationsService],
})
export class ReturnOrdersModule {}
