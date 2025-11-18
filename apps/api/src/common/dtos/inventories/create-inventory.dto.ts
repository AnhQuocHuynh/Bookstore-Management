import { IsInt, IsPositive } from 'class-validator';

export class CreateInventoryDto {
  @IsInt()
  @IsPositive()
  readonly quantity: number;
}
