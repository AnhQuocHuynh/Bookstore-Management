import { IsInt, IsNumber, IsOptional, IsPositive } from 'class-validator';

export class UpdateTransactionDetailDto {
  @IsOptional()
  @IsInt({
    message: 'Số lượng phải là số nguyên',
  })
  @IsPositive({
    message: 'Số lượng phải là số dương',
  })
  readonly quantity?: number;

  @IsOptional()
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

  @IsOptional()
  @IsNumber(
    {},
    {
      message: 'Giá trị khuyến mãi phải là số',
    },
  )
  @IsPositive({
    message: 'Giá trị khuyến mãi phải là số dương',
  })
  readonly discount?: number;
}
