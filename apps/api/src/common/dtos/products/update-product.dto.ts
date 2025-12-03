import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly sku?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly description?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  readonly price?: number;

  @IsOptional()
  @IsBoolean()
  readonly isActive?: boolean;
}
