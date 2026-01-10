import { IsNonEmptyString } from '@/common/decorators';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { IsBoolean, IsNumber, IsOptional, IsPositive, IsUrl } from 'class-validator';

export class UpdateProductDto {
  @ApiPropertyOptional({
    description: 'Mã SKU của sản phẩm',
    example: 'SKU_001',
  })
  @IsOptional()
  @IsNonEmptyString({
    message: 'Mã SKU không hợp lệ',
  })
  readonly sku?: string;

  @ApiPropertyOptional({
    description: 'Tên sản phẩm',
    example: 'Clean Architecture (Bản cập nhật)',
  })
  @IsOptional()
  @IsNonEmptyString({
    message: 'Tên sản phẩm không hợp lệ',
  })
  readonly name?: string;

  @ApiPropertyOptional({
    description: 'Mô tả sản phẩm',
    example: 'Phiên bản cập nhật năm 2025',
  })
  @IsOptional()
  @IsNonEmptyString({
    message: 'Mô tả sản phẩm không hợp lệ',
  })
  readonly description?: string;

  @ApiPropertyOptional({
    description: 'Giá bán sản phẩm',
    example: 250000,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Giá bán phải là số' })
  @IsPositive({ message: 'Giá bán phải lớn hơn 0' })
  readonly price?: number;

  @ApiPropertyOptional({
    description: 'Trạng thái kinh doanh của sản phẩm',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Trạng thái sản phẩm phải là true hoặc false' })
  readonly isActive?: boolean;

  // --- THÊM ĐOẠN NÀY ---
  @ApiPropertyOptional({
    description: 'Đường dẫn ảnh sản phẩm (URL từ API upload)',
    example: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Đường dẫn ảnh phải là URL hợp lệ' })
  readonly imageUrl?: string;
}
