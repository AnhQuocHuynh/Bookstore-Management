import { IsVietnamesePhoneNumber } from '@/common/decorators';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ description: 'Họ và tên đầy đủ' })
  @IsOptional()
  @IsString({ message: 'FullName phải là một chuỗi' })
  @IsNotEmpty({ message: 'FullName không được để trống' })
  readonly fullName?: string;

  @ApiPropertyOptional({ description: 'Số điện thoại Việt Nam' })
  @IsOptional()
  @IsVietnamesePhoneNumber({ message: 'Số điện thoại không hợp lệ' })
  readonly phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'Ngày sinh',
    type: String,
    format: 'date-time',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'BirthDate phải là một ngày hợp lệ' })
  readonly birthDate?: Date;

  @ApiPropertyOptional({ description: 'Địa chỉ' })
  @IsOptional()
  @IsString({ message: 'Address phải là một chuỗi' })
  @IsNotEmpty({ message: 'Address không được để trống' })
  readonly address?: string;

  @ApiPropertyOptional({ description: 'URL logo', format: 'url' })
  @IsOptional()
  @IsUrl({}, { message: 'LogoUrl phải là một URL hợp lệ' })
  readonly logoUrl?: string;
}
