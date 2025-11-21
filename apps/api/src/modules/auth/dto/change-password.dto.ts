import { IsStrongPassword } from '@/common/decorators';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class ChangePasswordDto {
  @IsStrongPassword()
  readonly newPassword: string;

  @IsString()
  @IsNotEmpty()
  readonly currentPassword: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  readonly otp: string;
}
