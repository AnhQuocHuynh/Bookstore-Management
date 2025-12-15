import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class ReduceDisplayProductQuantityDto {
  @ApiProperty({
    description: 'Số lượng trưng bày',
    example: 10,
    type: Number,
  })
  @IsInt({
    message: 'Số lượng trưng bày phải là số nguyên',
  })
  @IsPositive({
    message: 'Số lượng trưng bày phải là số dương',
  })
  readonly quantity: number;
}
