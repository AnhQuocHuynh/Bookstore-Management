import { DisplayProductStatus } from '@/common/enums';
import { IsEnum, IsInt, IsOptional, IsPositive } from 'class-validator';

export class UpdateDisplayProductDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  readonly quantity: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  readonly displayOrder?: number;

  @IsOptional()
  @IsEnum(DisplayProductStatus)
  readonly status?: DisplayProductStatus;
}
