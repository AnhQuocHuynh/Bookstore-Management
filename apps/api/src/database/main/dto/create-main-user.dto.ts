import { IsStrongPassword, IsVietnamesePhoneNumber } from '@/common/decorators';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateMainUserDto {
  @IsString()
  @IsNotEmpty()
  readonly fullName: string;

  @IsEmail()
  readonly email: string;

  @IsStrongPassword()
  readonly password: string;

  @IsVietnamesePhoneNumber()
  readonly phoneNumber: string;
}
