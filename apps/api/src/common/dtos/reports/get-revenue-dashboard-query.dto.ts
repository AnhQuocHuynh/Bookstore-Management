import { TransformToDate } from '@/common/transformers';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsDate, IsEnum, IsInt, IsPositive, IsArray, IsString, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum PeriodType {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
}

export class GetRevenueDashboardQueryDto {
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
    enum: PeriodType,
    example: PeriodType.DAY,
    default: PeriodType.DAY,
  })
  @IsOptional()
  @IsEnum(PeriodType, { message: 'Khoảng thời gian group không hợp lệ' })
  period?: PeriodType;

  @ApiPropertyOptional({
    description: 'Số lượng sản phẩm top cần lấy cho donut chart và top products list',
    example: 6,
    default: 6,
    minimum: 1,
    maximum: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'topN phải là số nguyên' })
  @IsPositive({ message: 'topN phải là số dương' })
  @Max(50, { message: 'topN không được vượt quá 50' })
  topN?: number;

  @ApiPropertyOptional({
    description: 'Lọc theo danh mục (category IDs)',
    type: [String],
    example: ['uuid1', 'uuid2'],
  })
  @IsOptional()
  @IsArray({ message: 'categoryIds phải là mảng' })
  @IsString({ each: true, message: 'Mỗi categoryId phải là chuỗi' })
  categoryIds?: string[];

  @ApiPropertyOptional({
    description: 'Tìm kiếm sản phẩm theo tên hoặc SKU (cho donut chart và top products list)',
    example: 'Tập 100',
  })
  @IsOptional()
  @IsString({ message: 'search phải là chuỗi' })
  search?: string;
}

