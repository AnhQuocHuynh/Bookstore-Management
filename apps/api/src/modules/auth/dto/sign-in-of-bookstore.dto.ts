import { IsEmail, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class SignInOfBookStoreDto {
  @IsEmail()
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  readonly password: string;

  @IsUUID()
  readonly bookStoreId: string;
}
