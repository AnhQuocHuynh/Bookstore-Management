import { PaymentMethod } from '@/common/enums';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsPositive } from 'class-validator';

export class UpdateTransactionDto {
  @ApiPropertyOptional({
    enum: PaymentMethod,
    description: 'Phương thức thanh toán',
    example: PaymentMethod.CASH,
  })
  @IsOptional()
  @IsEnum(PaymentMethod, {
    message: 'Phương thức thanh toán không hợp lệ',
  })
  readonly paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({
    description: 'Số tiền khuyến mãi áp dụng cho giao dịch',
    example: 50000,
    minimum: 1,
  })
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
