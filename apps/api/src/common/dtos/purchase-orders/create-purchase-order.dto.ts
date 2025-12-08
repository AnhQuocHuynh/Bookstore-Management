import { IsNonEmptyString } from '@/common/decorators';
import { CreatePurchaseOrderDetailDto } from '@/common/dtos';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class CreatePurchaseOrderDto {
  @ApiPropertyOptional({
    description: 'Mã của nhà cung cấp',
    example: 'your-uuid-here',
  })
  @IsUUID('all', {
    message: 'Mã của nhà cung cấp không hợp lệ.',
  })
  readonly supplierId: string;

  @ApiPropertyOptional({
    description: 'Ghi chú cho đơn mua (nếu có).',
    example: 'Ghi chú...',
  })
  @IsOptional()
  @IsNonEmptyString({
    message: 'Ghi chú không hợp lệ.',
  })
  readonly note?: string;

  @ApiProperty({
    type: [CreatePurchaseOrderDetailDto],
    description: 'Thông tin chi tiết đơn mua',
    example: [
      {
        quantity: 10,
        unitPrice: 15000,
        productId: 'your-product-uuid-here',
      },
    ],
  })
  @IsNotEmpty({
    message: 'Thông tin chi tiết đơn mua không được để trống.',
  })
  @Type(() => CreatePurchaseOrderDetailDto)
  @IsArray({
    message: 'Thông tin chi tiết đơn mua phải là dạng mảng.',
  })
  @ArrayNotEmpty({
    message: 'Thông tin chi tiết đơn mua phải là mảng không rỗng.',
  })
  @ValidateNested({
    each: true,
  })
  readonly createPurchaseOrderDetailDtos: CreatePurchaseOrderDetailDto[];
}
