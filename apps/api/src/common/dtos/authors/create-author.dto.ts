import { IsVietnamesePhoneNumber } from '@/common/decorators';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAuthorDto {
  @IsString()
  @IsNotEmpty()
  readonly fullName: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly penName?: string;

  @IsOptional()
  @IsEmail()
  readonly email?: string;

  @IsOptional()
  @IsVietnamesePhoneNumber()
  readonly phone?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly nationality?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly bio?: string;
}
