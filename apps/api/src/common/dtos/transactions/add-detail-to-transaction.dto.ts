import { ApiProperty } from '@nestjs/swagger';
import { CreateTransactionDetailDto } from '@/common/dtos';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, ValidateNested } from 'class-validator';

export class AddDetailToTransactionDto {
  @ApiProperty({
    type: [CreateTransactionDetailDto],
    description: 'Danh sách chi tiết sản phẩm cần thêm vào hoá đơn',
    example: [
      {
        productId: '550e8400-e29b-41d4-a716-446655440000',
        quantity: 2,
        unitPrice: 120000,
      },
    ],
  })
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => CreateTransactionDetailDto)
  @ValidateNested({ each: true })
  readonly createTransactionDetailDtos: CreateTransactionDetailDto[];
}
