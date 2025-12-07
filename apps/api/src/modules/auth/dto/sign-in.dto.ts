import { IsNonEmptyString } from '@/common/decorators';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class SignInDto {
  @ApiProperty({
    description: 'Email đăng nhập',
    example: 'user123@gmail.com',
  })
  @IsEmail(
    {},
    {
      message: 'Email không hợp lệ.',
    },
  )
  readonly email: string;

  @ApiProperty({
    description: 'Mật khẩu đăng nhập',
    example: 'password123',
  })
  @IsNonEmptyString({
    message: 'Mật khẩu không hợp lệ.',
  })
  readonly password: string;
}
