import { IsVietnamesePhoneNumber } from '@/common/decorators';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly fullName?: string;

  @IsOptional()
  @IsVietnamesePhoneNumber()
  readonly phoneNumber?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  readonly birthDate?: Date;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly address?: string;

  @IsOptional()
  @IsUrl()
  readonly logoUrl?: string;
}
