import { TransformToDate } from '@/common/transformers';
import { ProductType } from '@/common/enums';
import { PeriodType } from './get-revenue-dashboard-query.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsDate,
  IsEnum,
  IsArray,
  IsString,
  IsUUID,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GetStockDashboardQueryDto {
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
    description: 'Lọc theo danh mục sản phẩm (mảng UUID)',
    type: [String],
    example: ['uuid1', 'uuid2'],
  })
  @IsOptional()
  @IsArray({ message: 'Danh mục sản phẩm không hợp lệ' })
  @IsUUID('all', { each: true, message: 'Mỗi ID danh mục phải là UUID hợp lệ' })
  categoryIds?: string[];

  @ApiPropertyOptional({
    description: 'Lọc theo loại sản phẩm',
    enum: ProductType,
    example: ProductType.STATIONERY,
  })
  @IsOptional()
  @IsEnum(ProductType, { message: 'Loại sản phẩm không hợp lệ' })
  productType?: ProductType;

  @ApiPropertyOptional({
    description: 'Tìm kiếm sản phẩm theo tên hoặc SKU',
    example: 'Tập 100',
  })
  @IsOptional()
  @IsString({ message: 'Từ khóa tìm kiếm phải là chuỗi' })
  search?: string;

  @ApiPropertyOptional({
    description: 'Sắp xếp theo trường: name, sku, stockQuantity',
    enum: ['name', 'sku', 'stockQuantity'],
    example: 'name',
  })
  @IsOptional()
  @IsEnum(['name', 'sku', 'stockQuantity'], {
    message: 'Trường sắp xếp không hợp lệ',
  })
  sortBy?: 'name' | 'sku' | 'stockQuantity';

  @ApiPropertyOptional({
    description: 'Thứ tự sắp xếp: ASC hoặc DESC',
    enum: ['ASC', 'DESC'],
    example: 'ASC',
  })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'], { message: 'Thứ tự sắp xếp không hợp lệ' })
  sortOrder?: 'ASC' | 'DESC';

  @ApiPropertyOptional({
    description: 'Số trang (mặc định: 1)',
    example: 1,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Số trang phải là số nguyên' })
  @Min(1, { message: 'Số trang phải lớn hơn hoặc bằng 1' })
  page?: number;

  @ApiPropertyOptional({
    description: 'Số lượng mục trên mỗi trang (mặc định: 20)',
    example: 20,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Giới hạn phải là số nguyên' })
  @Min(1, { message: 'Giới hạn phải lớn hơn hoặc bằng 1' })
  @Max(100, { message: 'Giới hạn không được vượt quá 100' })
  limit?: number;

  @ApiPropertyOptional({
    description: 'ID sản phẩm để lấy dữ liệu biểu đồ (tùy chọn)',
    example: 'uuid1',
  })
  @IsOptional()
  @IsUUID('all', { message: 'ID sản phẩm phải là UUID hợp lệ' })
  productId?: string;

  @ApiPropertyOptional({
    description: 'Khoảng thời gian group cho biểu đồ bán hàng: day | week | month',
    enum: PeriodType,
    example: PeriodType.DAY,
  })
  @IsOptional()
  @IsEnum(PeriodType, { message: 'Khoảng thời gian group bán hàng không hợp lệ' })
  salesPeriod?: PeriodType;

  @ApiPropertyOptional({
    description: 'Thời gian bắt đầu cho biểu đồ bán hàng (YYYY-MM-DD)',
    example: '2025-08-20',
    type: String,
  })
  @IsOptional()
  @TransformToDate()
  @IsDate({ message: 'Thời gian bắt đầu biểu đồ bán hàng không hợp lệ' })
  salesFrom?: Date;

  @ApiPropertyOptional({
    description: 'Thời gian kết thúc cho biểu đồ bán hàng (YYYY-MM-DD)',
    example: '2025-08-25',
    type: String,
  })
  @IsOptional()
  @TransformToDate()
  @IsDate({ message: 'Thời gian kết thúc biểu đồ bán hàng không hợp lệ' })
  salesTo?: Date;

  @ApiPropertyOptional({
    description: 'Khoảng thời gian group cho biểu đồ nhập hàng: day | week | month',
    enum: PeriodType,
    example: PeriodType.MONTH,
  })
  @IsOptional()
  @IsEnum(PeriodType, { message: 'Khoảng thời gian group nhập hàng không hợp lệ' })
  importPeriod?: PeriodType;

  @ApiPropertyOptional({
    description: 'Thời gian bắt đầu cho biểu đồ nhập hàng (YYYY-MM-DD)',
    example: '2025-06-01',
    type: String,
  })
  @IsOptional()
  @TransformToDate()
  @IsDate({ message: 'Thời gian bắt đầu biểu đồ nhập hàng không hợp lệ' })
  importFrom?: Date;

  @ApiPropertyOptional({
    description: 'Thời gian kết thúc cho biểu đồ nhập hàng (YYYY-MM-DD)',
    example: '2025-12-25',
    type: String,
  })
  @IsOptional()
  @TransformToDate()
  @IsDate({ message: 'Thời gian kết thúc biểu đồ nhập hàng không hợp lệ' })
  importTo?: Date;
}
