import { CreateBookDto } from '@/common/dtos/books';
import { CreateInventoryDto } from '@/common/dtos/inventories';
import { ProductType } from '@/common/enums';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly description?: string;

  @IsNumber()
  @IsPositive()
  readonly price: number;

  @IsEnum(ProductType)
  readonly type: ProductType;

  @IsUUID()
  readonly supplierId: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('all', {
    each: true,
  })
  readonly categoryIds: string[];

  @ValidateIf((o) => o.type === ProductType.BOOK)
  @Type(() => CreateBookDto)
  @ValidateNested()
  @IsNotEmpty()
  readonly createBookDto?: CreateBookDto;

  @Type(() => CreateInventoryDto)
  @ValidateNested()
  @IsNotEmpty()
  readonly createInventoryDto: CreateInventoryDto;
}
