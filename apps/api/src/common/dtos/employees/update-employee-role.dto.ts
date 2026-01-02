import { EmployeeRole } from '@/common/enums';
import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateEmployeeRoleDto {
  @ApiProperty({
    description: 'Vai trò của nhân viên',
    enum: EmployeeRole,
    example: EmployeeRole.CASHIER,
  })
  @IsEnum(EmployeeRole, {
    message: 'Role không hợp lệ',
  })
  readonly role: EmployeeRole;
}
