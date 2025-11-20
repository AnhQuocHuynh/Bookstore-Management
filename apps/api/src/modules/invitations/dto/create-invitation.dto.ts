import { EmployeeRole } from '@/common/enums';
import { IsEmail, IsEnum } from 'class-validator';

export class CreateInvitationDto {
  @IsEmail()
  readonly email: string;

  @IsEnum(EmployeeRole)
  readonly role: EmployeeRole;
}
