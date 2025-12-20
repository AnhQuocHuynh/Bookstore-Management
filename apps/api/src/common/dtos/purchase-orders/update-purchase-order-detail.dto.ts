import { IsInt, IsNumber, IsUUID } from 'class-validator';

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
}
