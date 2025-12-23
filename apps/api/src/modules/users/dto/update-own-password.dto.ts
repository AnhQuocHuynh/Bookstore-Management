import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateOwnPasswordDto {
  @ApiProperty({
    description: 'Token dùng để xác thực request thay đổi mật khẩu',
  })
  @IsString({ message: 'Token phải là một chuỗi' })
  @IsNotEmpty({ message: 'Token không được để trống' })
  readonly token: string;

  @ApiProperty({ description: 'Mật khẩu hiện tại' })
  @IsString({ message: 'CurrentPassword phải là một chuỗi' })
  @IsNotEmpty({ message: 'CurrentPassword không được để trống' })
  readonly currentPassword: string;

  @ApiProperty({ description: 'Mật khẩu mới' })
  @IsString({ message: 'NewPassword phải là một chuỗi' })
  @IsNotEmpty({ message: 'NewPassword không được để trống' })
  readonly newPassword: string;
}
