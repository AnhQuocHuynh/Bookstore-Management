import { IsNonEmptyString } from '@/common/decorators';
import { CreateTransactionDetailDto } from '@/common/dtos';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsNumber,
  IsOptional,
  IsPositive,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTransactionDto {
  @ApiProperty({
    description: 'Danh sách chi tiết các sản phẩm trong đơn mua hàng',
    type: CreateTransactionDetailDto,
    isArray: true,
    example: [
      {
        productId: 'uuid-product-1',
        quantity: 2,
        price: 50000,
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

  @ApiPropertyOptional({
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
  readonly paidAmount?: number;

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
}
