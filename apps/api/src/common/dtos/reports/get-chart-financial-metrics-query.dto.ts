import { IsNonEmptyString } from '@/common/decorators';
import { TransformToDate } from '@/common/transformers';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsOptional } from 'class-validator';

export class GetChartFinancialMetricsQueryDto {
  @ApiPropertyOptional({
    description: 'Thời gian bắt đầu lọc (YYYY-MM-DD)',
    example: '2025-08-20',
    type: String,
  })
  @IsOptional()
  @TransformToDate()
  @IsDate({ message: 'Thời gian bắt đầu lọc không hợp lệ' })
  from?: Date;

  @ApiPropertyOptional({
    description: 'Thời gian kết thúc lọc (YYYY-MM-DD)',
    example: '2025-08-25',
    type: String,
  })
  @IsOptional()
  @TransformToDate()
  @IsDate({ message: 'Thời gian kết thúc lọc không hợp lệ' })
  to?: Date;

  @ApiPropertyOptional({
    description: 'Khoảng thời gian group: day | week | month',
    type: String,
    example: 'day',
  })
  @IsOptional()
  @IsNonEmptyString({
    message: 'Khoảng thời gian group không hợp lệ',
  })
  readonly period?: string;
}
