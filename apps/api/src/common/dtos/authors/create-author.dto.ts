import { IsVietnamesePhoneNumber } from '@/common/decorators';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAuthorDto {
  @ApiProperty({ description: 'Họ và tên đầy đủ của tác giả' })
  @IsString({ message: 'FullName phải là một chuỗi' })
  @IsNotEmpty({ message: 'FullName không được để trống' })
  readonly fullName: string;

  @ApiPropertyOptional({ description: 'Bút danh của tác giả' })
  @IsOptional()
  @IsString({ message: 'PenName phải là một chuỗi' })
  @IsNotEmpty({ message: 'PenName không được để trống' })
  readonly penName?: string;

  @ApiPropertyOptional({ description: 'Email của tác giả' })
  @IsOptional()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  readonly email?: string;

  @ApiPropertyOptional({ description: 'Số điện thoại Việt Nam của tác giả' })
  @IsOptional()
  @IsVietnamesePhoneNumber({ message: 'Số điện thoại không hợp lệ' })
  readonly phone?: string;

  @ApiPropertyOptional({ description: 'Quốc tịch của tác giả' })
  @IsOptional()
  @IsString({ message: 'Nationality phải là một chuỗi' })
  @IsNotEmpty({ message: 'Nationality không được để trống' })
  readonly nationality?: string;

  @ApiPropertyOptional({ description: 'Tiểu sử của tác giả' })
  @IsOptional()
  @IsString({ message: 'Bio phải là một chuỗi' })
  @IsNotEmpty({ message: 'Bio không được để trống' })
  readonly bio?: string;
}
