import { IsNonEmptyString } from '@/common/decorators';
import { PaymentMethod } from '@/common/enums';
import { TransformToDate } from '@/common/transformers';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsUUID,
} from 'class-validator';

export class GetTransactionsQueryDto {
  @IsOptional()
  @IsUUID('4', {
    message: 'Mã ID nhân viên không hợp lệ',
  })
  readonly cashierId?: string;

  @IsOptional()
  @IsNonEmptyString({
    message: 'Họ và tên nhân viên không hợp lệ',
  })
  readonly cashierName?: string;

  @IsOptional()
  @IsEnum(PaymentMethod, {
    message: 'Trạng thái thanh toán không hợp lệ',
  })
  readonly paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsBoolean({
    message: 'Trạng thái đã hoàn thành không hợp lệ',
  })
  @Transform(({ value }) => value === 'true')
  readonly isCompleted?: boolean;

  @IsOptional()
  @IsNumber(
    {},
    {
      message: 'Giá tổng nhỏ nhất phải là số',
    },
  )
  @IsPositive({ message: 'Giá tổng nhỏ nhất phải là số dương' })
  readonly minTotalAmount?: number;

  @IsOptional()
  @IsNumber(
    {},
    {
      message: 'Giá tổng lớn nhất phải là số',
    },
  )
  @IsPositive({ message: 'Giá tổng lớn nhất phải là số dương' })
  readonly maxTotalAmount?: number;

  @IsOptional()
  @IsNumber(
    {},
    {
      message: 'Giá sau cùng nhỏ nhất phải là số',
    },
  )
  @IsPositive({ message: 'Giá sau cùng nhỏ nhất phải là số dương' })
  readonly minFinalAmount?: number;

  @IsOptional()
  @IsNumber(
    {},
    {
      message: 'Giá sau cùng lớn nhất phải là số',
    },
  )
  @IsPositive({ message: 'Giá sau cùng lớn nhất phải là số dương' })
  readonly maxFinalAmount?: number;

  @ApiPropertyOptional({
    description: 'Thời gian bắt đầu lọc',
    example: '2025-08-20',
  })
  @IsOptional()
  @TransformToDate()
  @IsDate({
    message: 'Thời gian bắt đầu lọc không hợp lệ',
  })
  from?: Date;

  @ApiPropertyOptional({
    description: 'Thời gian kết thúc lọc',
    example: '2025-08-25',
  })
  @IsOptional()
  @TransformToDate()
  @IsDate({
    message: 'Thời gian kết thúc lọc không hợp lệ',
  })
  to?: Date;
}
