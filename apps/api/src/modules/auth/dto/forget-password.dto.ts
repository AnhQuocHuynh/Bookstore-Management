import { IsEmail, IsOptional, IsUUID } from 'class-validator';

export class ForgetPasswordDto {
  @IsEmail()
  readonly email!: string;

  @IsOptional()
  @IsUUID()
  readonly bookStoreId?: string;
}
