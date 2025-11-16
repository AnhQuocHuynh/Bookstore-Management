import { CreateBookStoreDto } from '@/database/main/dto';
import { SignInDto } from '@/modules/auth/dto/sign-in.dto';
import { UserRole } from '@/modules/users/enums';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export class SignUpDto extends SignInDto {
  @IsString()
  @IsNotEmpty()
  readonly fullName: string;

  @IsString()
  @IsNotEmpty()
  readonly phoneNumber: string;

  @IsEnum(UserRole)
  readonly role: UserRole;

  @ValidateIf((e) => e.role === UserRole.CUSTOMER)
  @IsUUID()
  readonly bookStoreId?: string;

  @ValidateIf((e) => e.role === UserRole.OWNER)
  @IsNotEmpty()
  @Type(() => CreateBookStoreDto)
  @ValidateNested()
  readonly createBookStoreDto?: CreateBookStoreDto;
}
