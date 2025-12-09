import { IsVietnamesePhoneNumber } from '@/common/decorators';
import { EmployeeRole } from '@/common/enums';
import { Type } from 'class-transformer';
import { IsDate, IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEmployeeByOwnerDto {
  @ApiProperty({ description: 'Họ và tên nhân viên' })
  @IsString({ message: 'FullName phải là một chuỗi' })
  @IsNotEmpty({ message: 'FullName không được để trống' })
  readonly fullName: string;

  @ApiProperty({ description: 'Số điện thoại Việt Nam' })
  @IsVietnamesePhoneNumber({ message: 'Số điện thoại không hợp lệ' })
  readonly phoneNumber: string;

  @ApiProperty({ description: 'Vai trò nhân viên', enum: EmployeeRole })
  @IsEnum(EmployeeRole, { message: 'Role không hợp lệ' })
  readonly role: EmployeeRole;

  @ApiProperty({ description: 'Email của nhân viên' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  readonly employeeEmail: string;

  @ApiProperty({ description: 'Ngày sinh', type: String, format: 'date-time' })
  @Type(() => Date)
  @IsDate({ message: 'BirthDate phải là một ngày hợp lệ' })
  readonly birthDate: Date;
}
