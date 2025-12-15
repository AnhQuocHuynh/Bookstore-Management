import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive, IsUUID } from 'class-validator';

export class CreateDisplayProductDto {
  @ApiProperty({
    type: Number,
    description: 'Số lượng cần trưng bày',
    example: 4,
  })
  @IsNumber(
    {},
    {
      message: 'Số lượng trưng bày phải là dạng số',
    },
  )
  @IsPositive({
    message: 'Số lượng trưng bày phải là số nguyên dương',
  })
  readonly quantity: number;

  @ApiPropertyOptional({
    description: 'Thứ tự trưng bày (tuỳ chọn)',
    type: Number,
    example: 2,
  })
  @IsOptional()
  @IsNumber(
    {},
    {
      message: 'Thứ tự trưng bày phải là dạng số',
    },
  )
  @IsPositive({
    message: 'Thứ tự trưng bày phải là số nguyên dương',
  })
  readonly displayOrder?: number;

  @ApiProperty({
    description: 'Mã ID của sản phẩm',
    example: 'uuid',
  })
  @IsUUID('all', {
    message: 'Mã ID của sản phẩm không hợp lệ.',
  })
  readonly productId: string;

  @ApiProperty({
    description: 'Mã ID của kệ trưng bày',
    example: 'uuid',
  })
  @IsUUID('all', {
    message: 'Mã ID của kệ trưng bày không hợp lệ.',
  })
  readonly displayShelfId: string;
}
