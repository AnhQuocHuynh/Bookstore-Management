import { IsVietnamesePhoneNumber } from '@/common/decorators';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEmail, IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateEmployeeDto {
  @ApiPropertyOptional({
    description: 'Họ và tên nhân viên',
    example: 'Nguyễn Văn A',
  })
  @IsOptional()
  @IsString()
  readonly fullName?: string;

  @ApiPropertyOptional({
    description: 'Địa chỉ nhân viên',
    example: '123 Đường ABC, Hà Nội',
  })
  @IsOptional()
  @IsString()
  readonly address?: string;

  @ApiPropertyOptional({
    description: 'Số điện thoại Việt Nam',
    example: '0912345678',
  })
  @IsOptional()
  @IsVietnamesePhoneNumber()
  readonly phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'Ngày sinh của nhân viên',
    example: '1990-01-01',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  readonly birthDate?: Date;

  @ApiPropertyOptional({
    description: 'URL avatar của nhân viên',
    example: 'https://example.com/avatar.png',
  })
  @IsOptional()
  @IsUrl()
  readonly avatarUrl?: string;

  @ApiPropertyOptional({
    description: 'Email nhân viên',
    example: 'nguyenvana@example.com',
  })
  @IsOptional()
  @IsEmail()
  readonly email?: string;
}
