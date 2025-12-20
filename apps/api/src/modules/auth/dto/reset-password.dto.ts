import { IsNonEmptyString, IsStrongPassword } from '@/common/decorators';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Mã auth code dùng để xác thực request.',
    example: 'auth-code-1',
  })
  @IsNonEmptyString({
    message: 'Mã auth code không hợp lệ.',
  })
  readonly authCode: string;

  @ApiProperty({
    description: 'Email gửi kèm',
    example: 'email1@gmail.com',
  })
  @IsEmail(
    {},
    {
      message: 'Email không hợp lệ.',
    },
  )
  readonly email: string;

  @ApiProperty({
    description: 'Mật khẩu mới.',
    example: 'newPassword123',
  })
  @IsStrongPassword({
    message: 'Mật khẩu mới chưa đủ mạnh.',
  })
  readonly newPassword: string;
}
