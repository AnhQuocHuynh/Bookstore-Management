import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class SignInOfBookStoreDto {
  @IsOptional()
  @IsEmail()
  readonly email?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly username?: string;

  @IsString()
  @IsNotEmpty()
  readonly password: string;

  @IsUUID()
  readonly bookStoreId: string;
}
