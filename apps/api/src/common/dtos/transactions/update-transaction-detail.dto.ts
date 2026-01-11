import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsPositive, Min } from 'class-validator';

export class UpdateTransactionDetailDto {
  @ApiPropertyOptional({
    description: 'Số lượng sản phẩm trong đơn hàng (>= 0, số nguyên)',
    example: 2,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({
    message: 'Số lượng phải là số nguyên',
  })
  @Min(0, {
    message: 'Số lượng phải lớn hơn hoặc bằng 0',
  })
  readonly quantity?: number;

  @ApiPropertyOptional({
    description: 'Giá bán ra của sản phẩm',
    example: 120000,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    {},
    {
      message: 'Giá bán ra phải là số',
    },
  )
  @IsPositive({
    message: 'Giá bán ra phải là số dương',
  })
  readonly unitPrice?: number;
}
