import { PaymentMethod } from '@/common/enums';
import { IsEnum, IsNumber, IsOptional, IsPositive } from 'class-validator';

export class UpdateTransactionDto {
  @IsOptional()
  @IsEnum(PaymentMethod, {
    message: 'Phương thức thanh toán không hợp lệ',
  })
  readonly paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsNumber(
    {},
    {
      message: 'Giá trị khuyến mãi phải là dạng số',
    },
  )
  @IsPositive({
    message: 'Giá trị khuyến mãi phải là số dương',
  })
  readonly discountAmount?: number;
}
