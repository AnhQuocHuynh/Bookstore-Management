import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsPositive, IsUUID } from 'class-validator';

export class UpdatePurchaseOrderDetailDto {
  @IsUUID('all', {
    message: 'Mã sản phẩm không hợp lệ.',
  })
  readonly productId: string;

  @IsInt({
    message: 'Số lượng không hợp lệ.',
  })
  readonly quantity: number;

  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    {
      message: 'Giá không hợp lệ.',
    },
  )
  readonly unitPrice: number;

  @ApiPropertyOptional({
    description: 'Tỷ lệ thuế của sản phẩm từ nhà cung cấp (nếu có)',
    type: Number,
    example: 0.03,
  })
  @IsNumber(
    {},
    {
      message: 'Tỷ lệ thuế phải là dạng số',
    },
  )
  @IsPositive({
    message: 'Tỷ lệ phải là số dương',
  })
  readonly taxRate?: number;
}
