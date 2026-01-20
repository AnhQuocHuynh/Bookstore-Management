import { Transform } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class DeleteUserNotificationsQueryDto {
  @Transform(({ value }) => {
    if (!value) return [];
    if (typeof value === 'string') {
      if (value.startsWith('[')) {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      }
      return value.split(',').map((id) => id.trim());
    }
    if (Array.isArray(value)) {
      return value;
    }
    return [];
  })
  @IsArray({
    message: 'Mảng các định danh của thông báo phải là dạng mảng',
  })
  @ArrayNotEmpty({
    message: 'Mảng các định danh thông báo phải là mảng không rỗng',
  })
  @IsUUID('4', {
    each: true,
    message: 'Định danh của một trong các thông báo không hợp lệ',
  })
  ids: string[];
}
