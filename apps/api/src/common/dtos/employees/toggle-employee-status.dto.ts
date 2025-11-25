import { IsBoolean, IsNotEmpty } from 'class-validator';

export class ToggleEmployeeStatusDto {
  @IsBoolean()
  @IsNotEmpty()
  readonly isActive: boolean;
}
