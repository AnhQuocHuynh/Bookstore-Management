import { EmployeeRole } from '@/common/enums';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';

export class GetEmployeesOfBookStoreQueryDto {
  @IsOptional()
  @IsEnum(EmployeeRole)
  readonly employeeRole?: EmployeeRole;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  readonly isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  readonly isFirstLogin?: boolean;
}
