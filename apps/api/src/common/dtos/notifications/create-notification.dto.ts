import { NotificationType, ReceiverType } from '@/common/enums';

export class CreateNotificationDto {
  readonly content: string[];
  readonly metadata?: any;
  readonly notificationType: NotificationType;
  readonly receiverId: string;
  readonly receiverType: ReceiverType;
}
