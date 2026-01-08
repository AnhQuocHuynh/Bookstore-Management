import { BookStoreId, Roles, UserSession } from '@/common/decorators';
import { DeleteUserNotificationsQueryDto } from '@/common/dtos/notifications';
import { MarkNotificationsAsReadDto } from '@/common/dtos/notifications/mark-notifications-as-read.dto';
import { TUserSession } from '@/common/utils';
import { NotificationsService } from '@/modules/notifications/notifications.service';
import { UserRole } from '@/modules/users/enums';
import { Body, Controller, Delete, Get, Patch, Query } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

@Controller('notifications')
@ApiExcludeController()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @Roles(UserRole.EMPLOYEE, UserRole.OWNER)
  async getNotificationsOfUser(@UserSession() userSession: TUserSession) {
    return this.notificationsService.getNotificationsOfUser(userSession);
  }

  @Patch('mark-as-read')
  @Roles(UserRole.EMPLOYEE, UserRole.OWNER)
  async markNotificationsAsRead(
    @UserSession() userSession: TUserSession,
    @Body() markNotificationsAsReadDto: MarkNotificationsAsReadDto,
  ) {
    return this.notificationsService.markNotificationsAsRead(
      userSession,
      markNotificationsAsReadDto,
    );
  }

  @Delete()
  @Roles(UserRole.OWNER, UserRole.EMPLOYEE)
  async deleteUserNotifications(
    @UserSession() userSession: TUserSession,
    @Query() deleteUserNotificationsQueryDto: DeleteUserNotificationsQueryDto,
  ) {
    return this.notificationsService.deleteUserNotifications(
      userSession,
      deleteUserNotificationsQueryDto,
    );
  }
}
