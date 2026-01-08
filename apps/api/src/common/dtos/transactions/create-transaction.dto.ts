import { IsNonEmptyString } from '@/common/decorators';
import { CreateTransactionDetailDto } from '@/common/dtos';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  ValidateNested,
} from 'class-validator';
import { PaymentMethod } from '@/common/enums';
import { Type } from 'class-transformer';

export class CreateTransactionDto {
  @ApiProperty({
    type: [CreateTransactionDetailDto],
    description: 'Danh sách chi tiết các sản phẩm trong đơn mua hàng',
    example: [
      {
        productId: '550e8400-e29b-41d4-a716-446655440000',
        quantity: 2,
        unitPrice: 120000,
      },
      {
        productId: '550e8400-e29b-41d4-a716-446655440001',
        quantity: 1,
      },
    ],
  })
  @IsArray({
    message: 'Thông tin tạo đơn mua hàng chi tiết phải là dạng mảng',
  })
  @ArrayNotEmpty({
    message: 'Thông tin tạo đơn mua hàng chi tiết phải là mảng không rỗng',
  })
  @ValidateNested({ each: true })
  @Type(() => CreateTransactionDetailDto)
  readonly createTransactionDetailDtos: CreateTransactionDetailDto[];

  @ApiPropertyOptional({
    description: 'Ghi chú cho đơn mua hàng',
    example: 'Ghi chú tạm',
  })
  @IsOptional()
  @IsNonEmptyString({
    message: 'Nội dung ghi chú không hợp lệ.',
  })
  readonly note?: string;

  @ApiProperty({
    description: 'Số tiền khách trả',
    example: 100000,
  })
  @IsNumber(
    {},
    {
      message: 'Số tiền khách trả phải là dạng số',
    },
  )
  @IsPositive({
    message: 'Số tiền khách trả phải là số dương',
  })
  readonly paidAmount: number;

  @ApiPropertyOptional({
    description: 'Số tiền trả cho khách',
    example: 50000,
  })
  @IsNumber(
    {},
    {
      message: 'Số tiền trả cho khách phải là dạng số',
    },
  )
  @IsPositive({
    message: 'Số tiền trả cho khách phải là số dương',
  })
  readonly changeAmount?: number;

  @ApiProperty({
    enum: PaymentMethod,
    description: 'Phương thức thanh toán',
    example: PaymentMethod.CASH,
  })
  @IsEnum(PaymentMethod, {
    message: 'Phương thức thanh toán không hợp lệ',
  })
  readonly paymentMethod: PaymentMethod;

  @ApiProperty({
    type: Number,
    description: 'Tổng số tiền khách phải trả',
    example: 200000,
  })
  @IsNumber(
    {},
    {
      message: 'Tổng số tiền phải trả phải là dạng số',
    },
  )
  @IsPositive({
    message: 'Tổng số tiền phải trả phải là số dương',
  })
  readonly finalAmount: number;

  @ApiProperty({
    type: Number,
    description: 'Tổng số tiền tax',
    example: 15000,
  })
  @IsNumber(
    {},
    {
      message: 'Tổng số tiền tax phải là dạng số',
    },
  )
  @IsPositive({
    message: 'Tổng số tiền tax phải là số dương',
  })
  readonly taxAmount: number;

  @ApiProperty({
    type: Number,
    description: 'Tổng số tiền ban đầu',
    example: 250000,
  })
  @IsNumber(
    {},
    {
      message: 'Tổng số tiền ban đầu phải là dạng số',
    },
  )
  @IsPositive({
    message: 'Tổng số tiền ban đầu phải là số dương',
  })
  readonly totalAmount: number;
}
