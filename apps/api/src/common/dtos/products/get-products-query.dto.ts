import { ProductType } from '@/common/enums';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class GetProductsQueryDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly sku?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly name?: string;

  @IsOptional()
  @IsEnum(ProductType)
  readonly type?: ProductType;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  readonly isActive?: boolean;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly supplierName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly categoryName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly categorySlug?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly sortBy?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  readonly sortOrder?: 'asc' | 'desc';
}
