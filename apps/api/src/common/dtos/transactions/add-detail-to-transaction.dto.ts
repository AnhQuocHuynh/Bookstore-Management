import { CreateTransactionDetailDto } from '@/common/dtos';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, ValidateNested } from 'class-validator';

export class AddDetailToTransactionDto {
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => CreateTransactionDetailDto)
  @ValidateNested({
    each: true,
  })
  readonly createTransactionDetailDtos: CreateTransactionDetailDto[];
}
