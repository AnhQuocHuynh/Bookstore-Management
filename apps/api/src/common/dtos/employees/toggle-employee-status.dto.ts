import { IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ToggleEmployeeStatusDto {
  @ApiProperty({
    description: 'Trạng thái kích hoạt của nhân viên',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  readonly isActive: boolean;
}
