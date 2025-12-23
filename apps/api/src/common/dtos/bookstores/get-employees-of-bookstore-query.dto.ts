import { EmployeeRole } from '@/common/enums';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetEmployeesOfBookStoreQueryDto {
  @IsOptional()
  @IsEnum(EmployeeRole)
  @ApiPropertyOptional({
    enum: EmployeeRole,
    description: 'Vai trò của nhân viên',
  })
  readonly employeeRole?: EmployeeRole;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  @ApiPropertyOptional({
    type: Boolean,
    description: 'Nhân viên có đang hoạt động không',
  })
  readonly isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  @ApiPropertyOptional({
    type: Boolean,
    description: 'Nhân viên có phải lần đầu đăng nhập không',
  })
  readonly isFirstLogin?: boolean;
}
