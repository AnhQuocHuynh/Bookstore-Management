import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTransactionDetailDto {
  @ApiProperty({
    description: 'ID của sản phẩm',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4', {
    message: 'Mã ID của sản phẩm không hợp lệ',
  })
  readonly productId: string;

  @ApiProperty({
    description: 'Số lượng sản phẩm',
    example: 2,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt({
    message: 'Số lượng sản phẩm phải là số nguyên',
  })
  @IsPositive({
    message: 'Số lượng sản phẩm phải là số dương.',
  })
  readonly quantity: number;

  @ApiPropertyOptional({
    description:
      'Giá sản phẩm tại thời điểm bán (nếu không truyền sẽ lấy giá hiện tại của sản phẩm)',
    example: 120000,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    {},
    {
      message: 'Giá sản phẩm lúc bán phải là dạng số',
    },
  )
  @IsPositive({ message: 'Giá sản phẩm lúc bán phải là số dương.' })
  readonly unitPrice?: number;
}
