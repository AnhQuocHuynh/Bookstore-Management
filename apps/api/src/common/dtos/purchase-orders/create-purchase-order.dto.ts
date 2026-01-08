import { IsNonEmptyString } from '@/common/decorators';
import { CreatePurchaseOrderDetailDto } from '@/common/dtos';
import { ProductType } from '@/common/enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class CreatePurchaseOrderDto {
  @ApiPropertyOptional({
    description: 'Mã của nhà cung cấp',
    example: 'your-uuid-here',
  })
  @IsUUID('all', {
    message: 'Mã của nhà cung cấp không hợp lệ.',
  })
  readonly supplierId: string;

  @ApiPropertyOptional({
    description: 'Ghi chú cho đơn mua (nếu có).',
    example: 'Ghi chú...',
  })
  @IsOptional()
  @IsNonEmptyString({
    message: 'Ghi chú không hợp lệ.',
  })
  readonly note?: string;

  @ApiProperty({
    type: [CreatePurchaseOrderDetailDto],
    description: 'Danh sách chi tiết đơn mua hàng',
    example: [
      {
        quantity: 5,
        unitPrice: 120000,
        createProductDto: {
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
      },
      {
        quantity: 5,
        unitPrice: 120000,
        createProductDto: {
          name: 'Clean Architecture',
          description: 'Sách về kiến trúc phần mềm',
          sku: '8938505974192',
          price: 200000,
          type: ProductType.STATIONERY,
          categoryIds: ['cat-book'],
          createInventoryDto: {
            stockQuantity: 5,
            costPrice: 120000,
          },
        },
      },
    ],
  })
  @IsNotEmpty({
    message: 'Thông tin chi tiết đơn mua không được để trống.',
  })
  @Type(() => CreatePurchaseOrderDetailDto)
  @IsArray({
    message: 'Thông tin chi tiết đơn mua phải là dạng mảng.',
  })
  @ArrayNotEmpty({
    message: 'Thông tin chi tiết đơn mua phải là mảng không rỗng.',
  })
  @ValidateNested({
    each: true,
  })
  readonly createPurchaseOrderDetailDtos: CreatePurchaseOrderDetailDto[];
}
