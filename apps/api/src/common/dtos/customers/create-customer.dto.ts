import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({
    description: 'Email của khách hàng',
    example: 'ngocanh@example.com',
  })
  @IsEmail(
    {},
    {
      message: 'Email khách hàng không hợp lệ',
    },
  )
  readonly email: string;

  @ApiProperty({
    description: 'Họ và tên khách hàng',
    example: 'Ngọc Anh Lê',
  })
  @IsString({
    message: 'Họ và tên khách hàng phải là dạng chuỗi',
  })
  @IsNotEmpty({
    message: 'Họ và tên khách hàng không được để trống',
  })
  readonly fullName: string;

  @ApiProperty({
    description: 'Số điện thoại khách hàng',
    example: '0912345678',
  })
  @IsString({
    message: 'Số điện thoại khách hàng phải là dạng chuỗi',
  })
  @IsNotEmpty({
    message: 'Số điện thoại khách hàng không được để trống',
  })
  readonly phoneNumber: string;

  @ApiProperty({
    description: 'Địa chỉ cư trú của khách hàng',
    example: '123 Đường Lê Lợi, Quận 1, TP.HCM',
  })
  @IsString({
    message: 'Địa chỉ cư trú khách hàng phải là dạng chuỗi',
  })
  @IsNotEmpty({
    message: 'Địa chỉ cư trú khách hàng không được để trống',
  })
  readonly address: string;

  @ApiPropertyOptional({
    description: 'Ghi chú thêm về khách hàng',
    example: 'Khách hàng thân thiết, hay mua sách văn phòng phẩm',
  })
  @IsOptional()
  @IsString({
    message: 'Ghi chú thêm về khách hàng phải là dạng chuỗi',
  })
  @IsNotEmpty({
    message: 'Ghi chú thêm về khách hàng không được để trống',
  })
  readonly note?: string;
}
