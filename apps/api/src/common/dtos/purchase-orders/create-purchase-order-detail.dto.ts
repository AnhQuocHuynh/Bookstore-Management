// === File: ./common/dtos/purchase-orders/create-purchase-order-detail.dto.ts ===

import { CreateProductDto } from '@/common/dtos/products';
import { ApiProperty } from '@nestjs/swagger'; // Bỏ ApiPropertyOptional
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  ValidateNested,
} from 'class-validator'; // Bỏ IsOptional, IsUUID

export class CreatePurchaseOrderDetailDto {
  @ApiProperty({
    description: 'Số lượng sản phẩm.',
    example: 10,
  })
  @IsInt({
    message: 'Số lượng sản phẩm phải là kiểu số',
  })
  @IsPositive({
    message: 'Số lượng sản phẩm phải là số nguyên dương',
  })
  readonly quantity: number;

  @ApiProperty({
    description: 'Giá trị giá của sản phẩm tại thời điểm mua',
  })
  @IsNumber(
    {},
    {
      message: 'Giá trị giá của sản phẩm phải là kiểu số',
    },
  )
  @IsPositive({
    message: 'Giá trị giá của sản phẩm phải là số nguyên dương',
  })
  readonly unitPrice: number;

  // --- ĐÃ XÓA productId ---

  @ApiProperty({
    type: CreateProductDto,
    description: 'Thông tin tạo sản phẩm mới (Bắt buộc)',
    // ... (Giữ nguyên example cũ)
  })
  @IsNotEmpty({ message: 'Thông tin sản phẩm là bắt buộc.' }) // Thêm thông báo lỗi rõ ràng
  @Type(() => CreateProductDto)
  @ValidateNested()
  readonly createProductDto: CreateProductDto; // Xóa dấu ? (optional)
}
