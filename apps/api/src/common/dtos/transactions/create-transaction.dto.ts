import { IsNonEmptyString } from '@/common/decorators';
import { CreateTransactionDetailDto } from '@/common/dtos';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsOptional,
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
  @Type(() => CreateTransactionDetailDto) // 🔥 BẮT BUỘC
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
}
