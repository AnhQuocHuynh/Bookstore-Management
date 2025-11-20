import { UserRole } from '@/modules/users/enums';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class GetBookStoresQueryDto {
  @IsString()
  @IsNotEmpty()
  readonly email: string;

  @IsEnum(UserRole)
  readonly role: UserRole;
}
