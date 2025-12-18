import {
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsUUID,
} from 'class-validator';

export class CreateTransactionDetailDto {
  @IsUUID('4', {
    message: 'Mã ID của sản phẩm không hợp lệ',
  })
  readonly productId: string;

  @IsInt({
    message: 'Số lượng sản phẩm phải là số nguyên',
  })
  @IsPositive({
    message: 'Số lượng sản phẩm phải là số dương.',
  })
  readonly quantity: number;

  @IsOptional()
  @IsNumber(
    {},
    {
      message: 'Giá sản phẩm lúc bán phải là dạng số',
    },
  )
  @IsPositive({ message: 'Giá sản phẩm lúc bán phải là số dương.' })
  readonly unitPrice?: number;
}
