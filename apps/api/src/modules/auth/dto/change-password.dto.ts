import { IsStrongPassword } from '@/common/decorators';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class ChangePasswordDto {
  @IsStrongPassword()
  readonly newPassword: string;

  @IsStrongPassword()
  readonly currentPassword: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  readonly otp: string;
}
