import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsPositive } from 'class-validator';

export class CreateInventoryDto {
  @ApiProperty({
    description: 'Số lượng tồn kho ban đầu',
    example: 100,
  })
  @IsInt({ message: 'Số lượng tồn kho phải là số nguyên' })
  @IsPositive({ message: 'Số lượng tồn kho phải lớn hơn 0' })
  readonly stockQuantity: number;

  @ApiProperty({
    description: 'Giá nhập sản phẩm',
    example: 150000,
  })
  @IsNumber({}, { message: 'Giá nhập phải là số' })
  @IsPositive({ message: 'Giá nhập phải lớn hơn 0' })
  readonly costPrice: number;
}
