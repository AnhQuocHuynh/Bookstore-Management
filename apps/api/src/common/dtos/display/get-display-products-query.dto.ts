import { DisplayProductStatus } from '@/common/enums';
import { TransformToDate } from '@/common/transformers';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';

export class GetDisplayProductsQueryDto {
  @IsOptional()
  @IsUUID()
  displayShelfId?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  displayShelfName?: string;

  @IsOptional()
  @IsUUID()
  productId?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  productName?: string;

  @IsOptional()
  @IsEnum(DisplayProductStatus)
  status?: DisplayProductStatus;

  @IsOptional()
  @IsInt()
  @IsPositive()
  quantityMin?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  quantityMax?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  displayOrderMin?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  displayOrderMax?: number;

  @IsOptional()
  @TransformToDate()
  from?: Date;

  @IsOptional()
  @TransformToDate()
  to?: Date;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  sort?: string;
}
