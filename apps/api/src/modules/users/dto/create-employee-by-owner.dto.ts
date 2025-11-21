import { IsVietnamesePhoneNumber } from '@/common/decorators';
import { EmployeeRole } from '@/common/enums';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateEmployeeByOwnerDto {
  @IsString()
  @IsNotEmpty()
  readonly fullName: string;

  @IsVietnamesePhoneNumber()
  readonly phoneNumber: string;

  @IsEnum(EmployeeRole)
  readonly role: EmployeeRole;
}
