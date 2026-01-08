import { IsNonEmptyString } from '@/common/decorators';
import { UpdatePurchaseOrderDetailDto } from '@/common/dtos';
import { PurchaseStatus } from '@/common/enums';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePurchaseOrderDto {
  @ApiPropertyOptional({
    description: 'Ghi chú của đơn mua',
    example: 'Cập nhật số lượng và đổi nhà cung cấp',
  })
  @IsOptional()
  @IsNonEmptyString({
    message: 'Ghi chú không hợp lệ',
  })
  readonly note?: string;

  @ApiPropertyOptional({
    description: 'ID của nhà cung cấp',
    example: '7b86d932-17d7-4e45-9a31-7c6be6c329ab',
  })
  @IsOptional()
  @IsUUID('all', {
    message: 'Mã nhà cung cấp không hợp lệ.',
  })
  readonly supplierId?: string;

  @ApiPropertyOptional({
    description: 'Trạng thái đơn mua',
    enum: PurchaseStatus,
    example: PurchaseStatus.PENDING_APPROVAL,
  })
  @IsOptional()
  @IsEnum(PurchaseStatus, {
    message: 'Trạng thái đơn mua không hợp lệ.',
  })
  readonly status?: PurchaseStatus;

  @ApiPropertyOptional({
    description: 'Danh sách chi tiết đơn mua cần cập nhật',
    type: [UpdatePurchaseOrderDetailDto],
    example: [
      {
        productId: '550e8400-e29b-41d4-a716-446655440000',
        quantity: 5,
        unitPrice: 150000,
      },
      {
        productId: '550e8400-e29b-41d4-a716-446655440001',
        quantity: 2,
        unitPrice: 120000,
      },
    ],
  })
  @IsOptional()
  @IsArray({ message: 'Danh sách chi tiết đơn mua phải là mảng' })
  @ArrayNotEmpty({ message: 'Danh sách chi tiết đơn mua không được rỗng' })
  @ValidateNested({ each: true })
  @Type(() => UpdatePurchaseOrderDetailDto)
  readonly updatePurchaseOrderDetailDtos?: UpdatePurchaseOrderDetailDto[];
}
