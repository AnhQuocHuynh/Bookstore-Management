import { IsNonEmptyString } from '@/common/decorators';
import { Transform } from 'class-transformer';
import { ArrayNotEmpty, IsDate, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateScheduleDto {
  @ApiProperty({
    description: 'ID của ca làm việc',
    example: 'bbb39e85-f93d-48fd-a33c-0b902161e0d6',
  })
  @IsUUID()
  shiftId: string;

  @ApiProperty({
    description: 'Ngày làm việc (YYYY-MM-DD)',
    example: '2025-12-15',
    type: String,
  })
  @Transform(({ value }) => new Date(value))
  @IsDate()
  workDate: Date;

  @ApiProperty({
    description: 'Danh sách ID nhân viên',
    example: [
      '7a3ef648-3a4d-497d-80c0-68c38a148015',
      '947f7b62-6a70-4fc7-9fe0-2620d006b4c1',
    ],
    type: [String],
  })
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  employeeIds: string[];

  @ApiPropertyOptional({
    description: 'Ghi chú cho ca làm việc',
    example: 'Ca sáng',
  })
  @IsOptional()
  @IsNonEmptyString()
  note?: string;
}
