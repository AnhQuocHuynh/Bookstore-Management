import { IsNonEmptyString, IsStrongPassword } from '@/common/decorators';
import { ApiProperty } from '@nestjs/swagger';
import { Length } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Mật khẩu mới.',
    example: 'newPassword123@',
  })
  @IsStrongPassword({
    message: 'Mật khẩu mới chưa đủ mạnh.',
  })
  readonly newPassword: string;

  @ApiProperty({
    description: 'Mật khẩu hiện tại.',
    example: 'currentPassword123',
  })
  @IsNonEmptyString({
    message: 'Mật khẩu hiện tại không được để trống.',
  })
  readonly currentPassword: string;

  @ApiProperty({
    description: 'Mã OTP',
    example: '123456',
  })
  @IsNonEmptyString({
    message: 'Mã OTP không hợp lệ.',
  })
  @Length(6, 6, {
    message: 'Mã OTP không hợp lệ.',
  })
  readonly otp: string;
}
