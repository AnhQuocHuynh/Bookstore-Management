import { IsStrongPassword, IsVietnamesePhoneNumber } from '@/common/decorators';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

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

  @IsString()
  @IsNotEmpty()
  readonly address: string;

  @Type(() => Date)
  @IsDate()
  readonly birthDate: Date;

  @IsOptional()
  @IsUrl()
  readonly avatarUrl?: string;
}
