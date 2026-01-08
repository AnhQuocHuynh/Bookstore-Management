import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class MarkNotificationsAsReadDto {
  @IsArray({
    message: 'Mảng các định danh thông báo phải có kiểu mảng',
  })
  @ArrayNotEmpty({
    message: 'Mảng các định danh thông báo phải là mảng không rỗng',
  })
  @IsUUID('4', {
    each: true,
    message: 'Định danh của một trong các thông báo không hợp lệ',
  })
  readonly userNotificationIds: string[];
}
