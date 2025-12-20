import { ProductType } from '@/common/enums';
import { TransformToDate } from '@/common/transformers';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsDate, IsEnum } from 'class-validator';

export class GetOverviewQueryDto {
  @ApiPropertyOptional({
    description: 'Thời gian bắt đầu lọc (YYYY-MM-DD)',
    example: '2025-08-20',
    type: String,
  })
  @IsOptional()
  @TransformToDate()
  @IsDate({ message: 'Thời gian bắt đầu lọc không hợp lệ' })
  from?: Date;

  @ApiPropertyOptional({
    description: 'Thời gian kết thúc lọc (YYYY-MM-DD)',
    example: '2025-08-25',
    type: String,
  })
  @IsOptional()
  @TransformToDate()
  @IsDate({ message: 'Thời gian kết thúc lọc không hợp lệ' })
  to?: Date;

  @ApiPropertyOptional({
    description: 'Lọc theo loại sản phẩm',
    enum: ProductType,
    example: ProductType.BOOK,
  })
  @IsOptional()
  @IsEnum(ProductType, { message: 'Loại sản phẩm không hợp lệ' })
  readonly productType?: ProductType;
}
