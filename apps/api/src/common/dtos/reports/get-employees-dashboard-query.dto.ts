import { TransformToDate } from '@/common/transformers';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsDate, IsInt, IsPositive, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetEmployeesDashboardQueryDto {
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
    description: 'Số trang',
    example: 1,
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page phải là số nguyên' })
  @Min(1, { message: 'page phải >= 1' })
  page?: number;

  @ApiPropertyOptional({
    description: 'Số lượng items mỗi trang',
    example: 20,
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit phải là số nguyên' })
  @IsPositive({ message: 'limit phải là số dương' })
  @Min(1, { message: 'limit phải >= 1' })
  limit?: number;
}

