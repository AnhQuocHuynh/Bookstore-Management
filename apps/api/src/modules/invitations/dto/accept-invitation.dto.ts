import { IsStrongPassword, IsVietnamesePhoneNumber } from '@/common/decorators';
import { EmployeeRole } from '@/common/enums';
import { IsEmail, IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class AcceptInvitationDto {
  @IsString()
  @IsNotEmpty()
  readonly fullName: string;

  @IsEmail()
  readonly email: string;

  @IsStrongPassword()
  readonly password: string;

  @IsVietnamesePhoneNumber()
  readonly phoneNumber: string;

  @IsUUID()
  readonly bookStoreId: string;

  @IsEnum(EmployeeRole)
  readonly role: EmployeeRole;
}
