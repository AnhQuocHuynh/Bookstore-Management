import { CreateTransactionDetailDto } from '@/common/dtos/transactions/create-transaction-detail.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, ValidateNested } from 'class-validator';

export class ReturnDetailsDto {
  @ApiProperty({
    description: 'Danh sách chi tiết các sản phẩm trong đơn mua hàng',
    type: CreateTransactionDetailDto,
    isArray: true,
    example: [
      {
        quantity: 3,
        unitPrice: 750000,
        productId: 'b101a1f4-5555-4c2a-9d11-aaaaaaaa0005',
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
}
