import { CreateBookStoreDto } from '@/database/main/dto';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';

export class SignUpDto {
  @IsEmail()
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  readonly password: string;

  @IsString()
  @IsNotEmpty()
  readonly fullName: string;

  @IsString()
  @IsNotEmpty()
  readonly phoneNumber: string;

  @Type(() => Date)
  @IsDate()
  readonly birthDate: Date;

  @IsString()
  @IsNotEmpty()
  readonly address: string;

  @IsNotEmpty()
  @Type(() => CreateBookStoreDto)
  @ValidateNested()
  readonly createBookStoreDto: CreateBookStoreDto;
}
