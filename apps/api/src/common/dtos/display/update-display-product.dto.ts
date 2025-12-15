import { DisplayProductStatus } from '@/common/enums';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsPositive } from 'class-validator';

export class UpdateDisplayProductDto {
  @ApiPropertyOptional({
    description: 'Số lượng trưng bày',
    example: 10,
    type: Number,
  })
  @IsOptional()
  @IsInt({
    message: 'Số lượng trưng bày phải là số nguyên',
  })
  @IsPositive({
    message: 'Số lượng trưng bày phải là số dương',
  })
  readonly quantity: number;

  @ApiPropertyOptional({
    description: 'Thứ tự trưng bày',
    example: 10,
    type: Number,
  })
  @IsOptional()
  @IsInt({
    message: 'Thứ tự trưng bày phải là số nguyên',
  })
  @IsPositive({
    message: 'Thứ tự trưng bày phải là số dương',
  })
  readonly displayOrder?: number;

  @ApiPropertyOptional({
    description: 'Trạng thái trưng bày',
    example: DisplayProductStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(DisplayProductStatus, {
    message: 'Trạng thái trưng bày không hợp lệ',
  })
  readonly status?: DisplayProductStatus;
}
