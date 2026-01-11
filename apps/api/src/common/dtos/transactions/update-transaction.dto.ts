import { PaymentMethod } from '@/common/enums';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

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
}
