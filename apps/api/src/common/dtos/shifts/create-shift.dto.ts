import { IsNonEmptyString } from '@/common/decorators';
import { IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateShiftDto {
  @ApiProperty({
    description: 'Tên ca làm việc',
    example: 'Ca sáng',
  })
  @IsNonEmptyString({
    message: 'Tên ca không hợp lệ.',
  })
  readonly name: string;

  @ApiProperty({
    description: 'Thời gian bắt đầu ca',
    example: '08:00',
  })
  @IsNonEmptyString({
    message: 'Thời gian bắt đầu không hợp lệ.',
  })
  readonly startTime: string;

  @ApiProperty({
    description: 'Thời gian kết thúc ca',
    example: '17:00',
  })
  @IsNonEmptyString({
    message: 'Thời gian kết thúc không hợp lệ.',
  })
  readonly endTime: string;

  @ApiPropertyOptional({
    description: 'Mô tả ca làm việc',
    example: 'Ca làm việc buổi sáng',
  })
  @IsOptional()
  @IsNonEmptyString({
    message: 'Mô tả ca làm không hợp lệ.',
  })
  readonly description?: string;
}
