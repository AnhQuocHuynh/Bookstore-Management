import { IsNonEmptyString } from '@/common/decorators';
import { CreateBookDto } from '@/common/dtos/books';
import { CreateInventoryDto } from '@/common/dtos/inventories';
import { ProductType } from '@/common/enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty({
    description: 'Tên sản phẩm',
    example: 'Clean Architecture',
  })
  @IsString({ message: 'Tên sản phẩm phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên sản phẩm không được để trống' })
  readonly name: string;

  @ApiProperty({
    description: 'Mã sku của sản phẩm',
    example: '8938505974192',
  })
  @IsNonEmptyString({
    message: 'Mã sku không hợp lệ',
  })
  readonly sku: string;

  @ApiPropertyOptional({
    description: 'Mô tả sản phẩm',
    example: 'Sách về kiến trúc phần mềm',
  })
  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Mô tả không được để trống' })
  readonly description?: string;

  @ApiProperty({
    description: 'Giá bán sản phẩm',
    example: 200000,
  })
  @IsNumber({}, { message: 'Giá bán phải là số' })
  @IsPositive({ message: 'Giá bán phải lớn hơn 0' })
  readonly price: number;

  @ApiProperty({
    description: 'Loại sản phẩm',
    enum: ProductType,
    example: ProductType.BOOK,
  })
  @IsEnum(ProductType, { message: 'Loại sản phẩm không hợp lệ' })
  readonly type: ProductType;

  @ApiProperty({
    description: 'Danh sách ID danh mục',
    example: ['cat-1', 'cat-2'],
  })
  @IsArray({ message: 'categoryIds phải là mảng' })
  @ArrayNotEmpty({ message: 'Danh sách danh mục không được rỗng' })
  @IsUUID('all', { each: true, message: 'ID danh mục không hợp lệ' })
  readonly categoryIds: string[];

  @ApiPropertyOptional({
    description: 'Thông tin sách (bắt buộc khi type = BOOK)',
    type: CreateBookDto,
  })
  @ValidateIf((o) => o.type === ProductType.BOOK)
  @Type(() => CreateBookDto)
  @ValidateNested()
  @IsNotEmpty({
    message: 'Thông tin sách là bắt buộc khi loại sản phẩm là BOOK',
  })
  readonly createBookDto?: CreateBookDto;

  @ApiProperty({
    description: 'Thông tin tồn kho ban đầu',
    type: CreateInventoryDto,
  })
  @Type(() => CreateInventoryDto)
  @ValidateNested()
  @IsNotEmpty({ message: 'Thông tin tồn kho không được để trống' })
  readonly createInventoryDto: CreateInventoryDto;

  @ApiPropertyOptional({
    description: 'Tỷ lệ thuế của sản phẩm từ nhà cung cấp (nếu có)',
    type: Number,
    example: 0.03,
  })
  @IsNumber(
    {},
    {
      message: 'Tỷ lệ thuế phải là dạng số',
    },
  )
  @IsPositive({
    message: 'Tỷ lệ phải là số dương',
  })
  readonly taxRate?: number;
}
