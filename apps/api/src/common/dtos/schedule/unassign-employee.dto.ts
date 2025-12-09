import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ArrayNotEmpty, IsDate, IsUUID } from 'class-validator';

export class UnassignEmployeeDto {
  @ApiProperty({
    description: 'ID của ca làm việc (UUID)',
    example: 'bbb39e85-f93d-48fd-a33c-0b902161e0d6',
  })
  @IsUUID('4', { message: 'shiftId phải là UUID hợp lệ' })
  readonly shiftId: string;

  @ApiProperty({
    description: 'Danh sách ID nhân viên cần gỡ khỏi ca làm (UUID)',
    example: [
      '7a3ef648-3a4d-497d-80c0-68c38a148015',
      '947f7b62-6a70-4fc7-9fe0-2620d006b4c1',
    ],
    type: [String],
  })
  @ArrayNotEmpty({ message: 'employeeIds không được để trống' })
  @IsUUID('4', { each: true, message: 'Mỗi employeeId phải là UUID hợp lệ' })
  employeeIds: string[];

  @ApiProperty({
    description: 'Ngày làm việc cần gỡ nhân viên',
    example: '2025-12-15',
    type: String,
    format: 'date',
  })
  @Transform(({ value }) => new Date(value))
  @IsDate({ message: 'workDate phải là ngày hợp lệ' })
  workDate: Date;
}
