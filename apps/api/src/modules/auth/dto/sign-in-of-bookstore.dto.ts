import { IsNonEmptyString } from '@/common/decorators';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class SignInOfBookStoreDto {
  @ApiPropertyOptional({
    description: 'Email đăng nhập.',
    example: 'owner1@gmail.com',
  })
  @IsOptional()
  @IsEmail(
    {},
    {
      message: 'Email không hợp lệ.',
    },
  )
  readonly email?: string;

  @ApiPropertyOptional({
    description: 'Tên đăng nhập',
    example: 'username21@gmail.com',
  })
  @IsOptional()
  @IsNonEmptyString({
    message: 'Tên đăng nhập không hợp lệ.',
  })
  readonly username?: string;

  @ApiProperty({
    description: 'Mật khẩu đăng nhập',
    example: ' password123',
  })
  @IsNonEmptyString({
    message: 'Mật khẩu không hợp lệ.',
  })
  readonly password: string;

  @ApiProperty({
    description: 'Mã định danh (dạng UUID) của nhà sách.',
    example: 'your-uuid-here',
  })
  @IsUUID('all', {
    message: 'Mã định danh nhà sách không hợp lệ.',
  })
  readonly bookStoreId: string;
}
