import { CreateProductDto } from '@/common/dtos/products';
import { ProductType } from '@/common/enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class CreatePurchaseOrderDetailDto {
  @ApiProperty({
    description: 'Số lượng sản phẩm.',
    example: 10,
  })
  @IsInt({
    message: 'Số lượng sản phẩm phải là kiểu số',
  })
  @IsPositive({
    message: 'Số lượng sản phẩm phải là số nguyên dương',
  })
  readonly quantity: number;

  @ApiProperty({
    description: 'Giá trị giá của sản phẩm tại thời điểm mua',
  })
  @IsNumber(
    {},
    {
      message: 'Giá trị giá của sản phẩm phải là kiểu số',
    },
  )
  @IsPositive({
    message: 'Giá trị giá của sản phẩm phải là số nguyên dương',
  })
  readonly unitPrice: number;

  @ApiPropertyOptional({
    description: 'Mã định danh sản phẩm (nếu có)',
    example: 'id-1',
  })
  @IsOptional()
  @IsUUID('4', {
    message: 'Mã định danh sản phẩm không hợp lệ',
  })
  readonly productId?: string;

  @ApiPropertyOptional({
    type: CreateProductDto,
    description: 'Thông tin tạo sản phẩm (nếu có)',
    example: {
      name: 'Clean Architecture',
      description: 'Sách về kiến trúc phần mềm',
      sku: '8938505974192',
      price: 200000,
      type: ProductType.BOOK,
      categoryIds: ['cat-book'],
      createBookDto: {
        isbn: '9780134494166',
        edition: 'Tái bản lần 1',
        language: 'Tiếng Việt',
        coverImage: 'https://cdn.example.com/books/clean-architecture.jpg',
        publicationDate: '2023-05-01',
        authorId: '550e8400-e29b-41d4-a716-446655440000',
        publisherId: '660e8400-e29b-41d4-a716-446655440111',
      },
      createInventoryDto: {
        stockQuantity: 5,
        costPrice: 120000,
      },
      taxRate: 0.03,
    },
  })
  @IsOptional()
  @IsNotEmpty()
  @Type(() => CreateProductDto)
  @ValidateNested()
  readonly createProductDto?: CreateProductDto;
}
