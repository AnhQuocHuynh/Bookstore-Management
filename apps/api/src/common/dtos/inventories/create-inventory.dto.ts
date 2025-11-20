import { IsInt, IsNumber, IsPositive } from 'class-validator';

export class CreateInventoryDto {
  @IsInt()
  @IsPositive()
  readonly stockQuantity: number;

  @IsNumber()
  @IsPositive()
  readonly costPrice: number;
}
