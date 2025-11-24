import { UserRole } from '@/modules/users/enums';
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class SignInDto {
  @IsEmail()
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  readonly password: string;
}
