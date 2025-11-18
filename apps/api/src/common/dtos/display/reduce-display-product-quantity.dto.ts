import { IsInt, IsPositive } from 'class-validator';

export class ReduceDisplayProductQuantityDto {
  @IsInt()
  @IsPositive()
  readonly quantity: number;
}
