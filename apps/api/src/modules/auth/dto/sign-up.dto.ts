import {
  IsNonEmptyString,
  IsStrongPassword,
  IsVietnamesePhoneNumber,
} from '@/common/decorators';
import { CreateBookStoreDto } from '@/database/main/dto';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEmail, IsNotEmpty, ValidateNested } from 'class-validator';

export class SignUpDto {
  @ApiProperty({
    description: 'Email đăng ký',
    example: 'owner@example.com',
  })
  @IsEmail(
    {},
    {
      message: 'Email không hợp lệ.',
    },
  )
  readonly email: string;

  @ApiProperty({
    description: 'Mật khẩu đăng ký',
    example: 'yourStrongPassword123@',
  })
  @IsStrongPassword({
    message: 'Mật khẩu không được để trống hoặc còn quá yếu.',
  })
  readonly password: string;

  @ApiProperty({
    description: 'Họ và tên',
    example: 'Lê Ngọc Anh',
  })
  @IsNonEmptyString({
    message: 'Họ và tên không hợp lệ.',
  })
  readonly fullName: string;

  @ApiProperty({
    description: 'Số điện thoại',
    example: '+84393873630',
  })
  @IsVietnamesePhoneNumber({
    message: 'Số điện thoại không hợp lệ.',
  })
  readonly phoneNumber: string;

  @ApiProperty({
    description: 'Ngày sinh',
    example: '2005-08-20',
  })
  @Type(() => Date)
  @IsDate({
    message: 'Ngày sinh không hợp lệ.',
  })
  readonly birthDate: Date;

  @ApiProperty({
    description: 'Địa chỉ',
    example: '123 Đường Lê Lợi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh',
  })
  @IsNonEmptyString({
    message: 'Địa chỉ không hợp lệ.',
  })
  readonly address: string;

  @ApiProperty({
    description: 'Thông tin đăng ký nhà sách',
  })
  @IsNotEmpty({
    message: 'Thông tin đăng ký nhà sách không được để trống.',
  })
  @Type(() => CreateBookStoreDto)
  @ValidateNested()
  readonly createBookStoreDto: CreateBookStoreDto;
}
