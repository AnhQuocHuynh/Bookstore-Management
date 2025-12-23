import { IsVietnamesePhoneNumber } from '@/common/decorators';
import { EmployeeRole } from '@/common/enums';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class UpdateEmployeeDto {
  @IsOptional()
  @IsString()
  readonly fullName?: string;

  @IsOptional()
  @IsString()
  readonly address?: string;

  @IsOptional()
  @IsVietnamesePhoneNumber()
  readonly phoneNumber?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  readonly birthDate?: Date;

  @IsOptional()
  @IsUrl()
  readonly logoUrl?: string;

  @IsOptional()
  @IsEnum(EmployeeRole)
  readonly role?: EmployeeRole;

  @IsOptional()
  @IsEmail()
  readonly email?: string;
}
