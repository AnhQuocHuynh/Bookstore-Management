import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
} from 'class-validator';

export class CreateBookDto {
  @ApiProperty({
    description: 'Mã ISBN của sách',
    example: '9780134494166',
  })
  @IsString({ message: 'ISBN phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'ISBN không được để trống' })
  readonly isbn: string;

  @ApiPropertyOptional({
    description: 'Phiên bản / lần tái bản',
    example: 'Tái bản lần 1',
  })
  @IsOptional()
  @IsString({ message: 'Edition phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Edition không được để trống' })
  readonly edition?: string;

  @ApiPropertyOptional({
    description: 'Ngôn ngữ của sách',
    example: 'Tiếng Việt',
  })
  @IsOptional()
  @IsString({ message: 'Ngôn ngữ phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Ngôn ngữ không được để trống' })
  readonly language?: string;

  @ApiProperty({
    description: 'Ảnh bìa sách (URL)',
    example: 'https://cdn.example.com/books/clean-architecture.jpg',
  })
  @IsUrl(
    {},
    {
      message: 'Đường dẫn đến ảnh bìa không hợp lệ.',
    },
  )
  readonly coverImage: string;

  @ApiPropertyOptional({
    description: 'Ngày phát hành',
    example: '2023-05-01',
  })
  @IsOptional()
  @IsDate({ message: 'Ngày phát hành không hợp lệ' })
  readonly publicationDate?: Date;

  @ApiProperty({
    description: 'ID tác giả',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4', { message: 'authorId không đúng định dạng UUID' })
  readonly authorId: string;

  @ApiProperty({
    description: 'ID nhà xuất bản',
    example: '660e8400-e29b-41d4-a716-446655440111',
  })
  @IsUUID('4', { message: 'publisherId không đúng định dạng UUID' })
  readonly publisherId: string;
}
