import {
  CreateNotificationDto,
  DeleteUserNotificationsQueryDto,
  MarkNotificationsAsReadDto,
} from '@/common/dtos/notifications';
import { ReceiverType } from '@/common/enums';
import { TUserSession } from '@/common/utils';
import { Notification, UserNotification } from '@/database/tenant/entities';
import { UserRole } from '@/modules/users/enums';
import { TenantService } from '@/tenants/tenant.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { omit } from 'lodash';

@Injectable()
export class NotificationsService {
  constructor(private readonly tenantsService: TenantService) {}

  async createNotification(
    createNotificationDto: CreateNotificationDto,
    bookStoreId?: string,
  ) {
    const dataSource = await this.tenantsService.getTenantConnection({
      bookStoreId,
    });

    const notifRepo = dataSource.getRepository(Notification);
    const userNotifRepo = dataSource.getRepository(UserNotification);
    const { notificationType } = createNotificationDto;

    const notif = await notifRepo.findOne({
      where: {
        type: notificationType,
      },
    });

    if (!notif) {
      throw new NotFoundException('Không tìm thấy thông báo');
    }

    const newUserNotif = userNotifRepo.create({
      ...omit(createNotificationDto, ['notificationType']),
      notification: notif,
    });

    return userNotifRepo.save(newUserNotif);
  }

  async getNotificationsOfUser(userSession: TUserSession) {
    const { bookStoreId, role, userId } = userSession;

    const dataSource = await this.tenantsService.getTenantConnection({
      bookStoreId,
    });

    const userNotifRepo = dataSource.getRepository(UserNotification);

    const notifs = await userNotifRepo.find({
      where: {
        receiverId: userId,
        receiverType:
          role === UserRole.OWNER ? ReceiverType.OWNER : ReceiverType.EMPLOYEE,
      },
      order: {
        createdAt: 'desc',
      },
      relations: {
        notification: true,
      },
    });

    return notifs;
  }

  async markNotificationsAsRead(
    userSession: TUserSession,
    markNotificationsAsReadDto: MarkNotificationsAsReadDto,
  ) {
    const dataSource = await this.tenantsService.getTenantConnection({
      bookStoreId: userSession.bookStoreId,
    });

    const userNotifsRepo = dataSource.getRepository(UserNotification);
    const { userNotificationIds } = markNotificationsAsReadDto;

    await Promise.all(
      userNotificationIds.map(async (id) => {
        const notif = await userNotifsRepo.findOne({
          where: {
            id,
          },
        });

        if (notif && !notif.isRead) {
          notif.isRead = true;
          notif.readAt = new Date();
          await userNotifsRepo.save(notif);
        }
      }),
    );

    return this.getNotificationsOfUser(userSession);
  }

  async deleteUserNotifications(
    userSession: TUserSession,
    deleteUserNotificationsQueryDto: DeleteUserNotificationsQueryDto,
  ) {
    const { bookStoreId } = userSession;

    const dataSource = await this.tenantsService.getTenantConnection({
      bookStoreId,
    });

    const userNotifRepo = dataSource.getRepository(UserNotification);

    const { ids } = deleteUserNotificationsQueryDto;

    await Promise.all(
      ids.map(async (id) => {
        await userNotifRepo.delete({ id });
      }),
    );

    return this.getNotificationsOfUser(userSession);
  }
}
