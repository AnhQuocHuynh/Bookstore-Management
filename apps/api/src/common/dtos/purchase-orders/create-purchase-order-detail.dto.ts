import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsPositive, IsUUID } from 'class-validator';

export class CreatePurchaseOrderDetailDto {
  @ApiProperty({
    description: 'Số lượng sản phẩm.',
    example: 10,
  })
  @IsInt({
    message: 'Số lượng sản phẩm phải là kiểu số',
  })
  @IsPositive({
    message: 'Số lượng sản phẩm phải là số nguyên dương',
  })
  readonly quantity: number;

  @ApiProperty({
    description: 'Giá trị giá của sản phẩm tại thời điểm mua',
  })
  @IsNumber(
    {},
    {
      message: 'Giá trị giá của sản phẩm phải là kiểu số',
    },
  )
  @IsPositive({
    message: 'Giá trị giá của sản phẩm phải là số nguyên dương',
  })
  readonly unitPrice: number;

  @ApiProperty({
    description: 'Mã sản phẩm',
    example: 'your-product-uuid-here',
  })
  @IsUUID()
  readonly productId: string;
}
