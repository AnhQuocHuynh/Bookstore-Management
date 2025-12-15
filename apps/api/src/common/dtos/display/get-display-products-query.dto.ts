import { IsNonEmptyString } from '@/common/decorators';
import { DisplayProductStatus } from '@/common/enums';
import { TransformToDate } from '@/common/transformers';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsUUID,
} from 'class-validator';

export class GetDisplayProductsQueryDto {
  @ApiPropertyOptional({
    description: 'Mã ID của kệ trưng bày',
    example: 'id-1',
  })
  @IsOptional()
  @IsUUID('4', {
    message: 'Mã ID kệ trưng bày không hợp lệ',
  })
  displayShelfId?: string;

  @ApiPropertyOptional({
    description: 'Tên kệ trưng bày',
    example: 'Kệ 1',
  })
  @IsOptional()
  @IsNonEmptyString({
    message: 'Tên kệ trưng bày không hợp lệ',
  })
  displayShelfName?: string;

  @ApiPropertyOptional({
    description: 'Mã ID của sản phẩm',
    example: 'id-1',
  })
  @IsOptional()
  @IsUUID('4', {
    message: 'Mã ID sản phẩm không hợp lệ',
  })
  productId?: string;

  @ApiPropertyOptional({
    description: 'Tên sản phẩm',
    example: 'Sản phẩm 1',
  })
  @IsOptional()
  @IsNonEmptyString({
    message: 'Tên sản phẩm không hợp lệ',
  })
  productName?: string;

  @ApiPropertyOptional({
    description: 'Trạng thái trưng bày sản phẩm',
    example: DisplayProductStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(DisplayProductStatus, {
    message: 'Trạng thái trưng bày sản phẩm không hợp lệ',
  })
  status?: DisplayProductStatus;

  @ApiPropertyOptional({
    description: 'Số lượng nhỏ nhất trưng bày sản phẩm',
    example: 2,
    type: Number,
  })
  @IsOptional()
  @IsInt({
    message: 'Số lượng nhỏ nhất phải là số nguyên',
  })
  @IsPositive({
    message: 'Số lượng nhỏ nhất phải là số dương',
  })
  quantityMin?: number;

  @ApiPropertyOptional({
    description: 'Số lượng lớn nhất sản phẩm trưng bày',
    example: 20,
    type: Number,
  })
  @IsOptional()
  @IsInt({
    message: 'Số lượng lớn nhất phải là số nguyên',
  })
  @IsPositive({
    message: 'Số lượng lớn nhất phải là số dương',
  })
  quantityMax?: number;

  @ApiPropertyOptional({
    description: 'Số thứ tự trưng bày nhỏ nhất sản phẩm trưng bày',
    example: 2,
    type: Number,
  })
  @IsOptional()
  @IsInt({
    message: 'Số thứ tự trưng bày nhỏ nhất phải là số nguyên',
  })
  @IsPositive({
    message: 'Số thứ tự trưng bày nhỏ nhất phải là số dương',
  })
  displayOrderMin?: number;

  @ApiPropertyOptional({
    description: 'Số thứ tự trưng bày lớn nhất sản phẩm trưng bày',
    example: 10,
    type: Number,
  })
  @IsOptional()
  @IsInt({
    message: 'Số thứ tự trưng bày lớn nhất phải là số nguyên',
  })
  @IsPositive({
    message: 'Số thứ tự trưng bày lớn nhất phải là số dương',
  })
  displayOrderMax?: number;

  @ApiPropertyOptional({
    description: 'Thời gian bắt đầu lọc',
    example: '2025-08-20',
  })
  @IsOptional()
  @TransformToDate()
  @IsDate({
    message: 'Thời gian bắt đầu lọc không hợp lệ',
  })
  from?: Date;

  @ApiPropertyOptional({
    description: 'Thời gian kết thúc lọc',
    example: '2025-08-25',
  })
  @IsOptional()
  @TransformToDate()
  @IsDate({
    message: 'Thời gian kết thúc lọc không hợp lệ',
  })
  to?: Date;

  @ApiPropertyOptional({
    description: 'Thứ tự sắp xếp',
    example: 'createdAt.asc',
  })
  @IsOptional()
  @IsNonEmptyString({
    message: 'Thứ tự sắp xếp không hợp lệ',
  })
  sort?: string;
}
