import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSupplierDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsEmail()
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  readonly phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  readonly address: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly taxCode?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly contactPerson?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly note?: string;
}
