import { IsNonEmptyString } from '@/common/decorators';
import { CreateTransactionDetailDto } from '@/common/dtos';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsOptional,
  ValidateNested,
} from 'class-validator';

export class CreateTransactionDto {
  @IsArray({
    message: 'Thông tin tạo đơn mua hàng chi tiết phải là dạng mảng',
  })
  @ArrayNotEmpty({
    message: 'Thông tin tạo đơn mua hàng chi tiết phải là mảng không rỗng',
  })
  @ValidateNested({
    each: true,
  })
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
