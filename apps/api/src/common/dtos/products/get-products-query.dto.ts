import { IsNonEmptyString } from '@/common/decorators';
import { ProductType } from '@/common/enums';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsIn, IsOptional } from 'class-validator';

export class GetProductsQueryDto {
  @ApiPropertyOptional({
    description: 'Mã SKU của sản phẩm',
    example: 'SKU_001',
  })
  @IsOptional()
  @IsNonEmptyString({
    message: 'SKU không hợp lệ',
  })
  readonly sku?: string;

  @ApiPropertyOptional({
    description: 'Tên sản phẩm',
    example: 'Sách lập trình NestJS',
  })
  @IsOptional()
  @IsNonEmptyString({
    message: 'Tên sản phẩm không hợp lệ',
  })
  readonly name?: string;

  @ApiPropertyOptional({
    description: 'Loại sản phẩm',
    enum: ProductType,
    example: ProductType.STATIONERY,
  })
  @IsOptional()
  @IsEnum(ProductType, {
    message: 'Loại sản phẩm không hợp lệ',
  })
  readonly type?: ProductType;

  @ApiPropertyOptional({
    description: 'Trạng thái kích hoạt của sản phẩm',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean({ message: 'isActive phải là kiểu boolean (true | false)' })
  readonly isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Tên nhà cung cấp',
    example: 'NXB Kim Đồng',
  })
  @IsOptional()
  @IsNonEmptyString({
    message: 'Tên nhà cung cấp không hợp lệ',
  })
  readonly supplierName?: string;

  @ApiPropertyOptional({
    description: 'Tên danh mục sản phẩm',
    example: 'Sách thiếu nhi',
  })
  @IsOptional()
  @IsNonEmptyString({
    message: 'Tên danh mục không hợp lệ',
  })
  readonly categoryName?: string;

  @ApiPropertyOptional({
    description: 'Slug của danh mục',
    example: 'sach-thieu-nhi',
  })
  @IsOptional()
  @IsNonEmptyString({
    message: 'Slug danh mục không hợp lệ',
  })
  readonly categorySlug?: string;

  @ApiPropertyOptional({
    description: 'Trường dùng để sắp xếp',
    example: 'createdAt',
  })
  @IsOptional()
  @IsNonEmptyString({
    message: 'Giá trị sortBy không hợp lệ',
  })
  readonly sortBy?: string;

  @ApiPropertyOptional({
    description: 'Thứ tự sắp xếp',
    enum: ['asc', 'desc'],
    example: 'desc',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'], {
    message: 'sortOrder chỉ nhận giá trị asc hoặc desc',
  })
  readonly sortOrder?: 'asc' | 'desc';
}
