import { IsNonEmptyString, IsVietnamesePhoneNumber } from '@/common/decorators';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUrl } from 'class-validator';

export class CreateBookStoreDto {
  @ApiProperty({
    description: 'Tên nhà sách',
    example: 'Nhà sách Vạn Kim',
  })
  @IsNonEmptyString({
    message: 'Tên nhà sách không hợp lệ.',
  })
  readonly name: string;

  @ApiProperty({
    description: 'Số điện thoại của nhà sách.',
    example: '+84393873630',
  })
  @IsVietnamesePhoneNumber({
    message: 'Số điện thoại của nhà sách không hợp lệ.',
  })
  readonly phoneNumber: string;

  @ApiProperty({
    description: 'Địa chỉ của nhà sách',
    example: '123 Đường Lê Lợi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh',
  })
  @IsNonEmptyString({
    message: 'Địa chỉ của nhà sách không hợp lệ.',
  })
  readonly address: string;

  @ApiPropertyOptional({
    description: 'Đường dẫn logo của nhà sách.',
    example: 'https://nhasachvankim.com.vn',
  })
  @IsOptional()
  @IsUrl(
    {},
    {
      message: 'Đường dẫn logo của nhà sách không hợp lệ.',
    },
  )
  readonly logoUrl?: string;
}
