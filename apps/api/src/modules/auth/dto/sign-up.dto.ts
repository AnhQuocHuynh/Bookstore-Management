import { CreateBookStoreDto } from '@/database/main/dto';
import { SignInDto } from '@/modules/auth/dto/sign-in.dto';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';

export class SignUpDto extends SignInDto {
  @IsString()
  @IsNotEmpty()
  readonly fullName: string;

  @IsString()
  @IsNotEmpty()
  readonly phoneNumber: string;

  @IsNotEmpty()
  @Type(() => CreateBookStoreDto)
  @ValidateNested()
  readonly createBookStoreDto: CreateBookStoreDto;
}
