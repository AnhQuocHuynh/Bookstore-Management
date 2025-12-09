import { IsNonEmptyString } from '@/common/decorators';
import { IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateShiftDto {
  @ApiPropertyOptional({
    description: 'Tên ca làm việc',
    example: 'Ca chiều',
  })
  @IsOptional()
  @IsNonEmptyString({
    message: 'Tên ca không hợp lệ.',
  })
  readonly name?: string;

  @ApiPropertyOptional({
    description: 'Mô tả ca làm việc',
    example: 'Ca làm việc buổi chiều',
  })
  @IsOptional()
  @IsNonEmptyString({
    message: 'Mô tả ca làm không hợp lệ.',
  })
  readonly description?: string;
}
