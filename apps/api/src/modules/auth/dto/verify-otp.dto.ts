import { OtpTypeEnum } from '@/common/enums';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';

export class VerifyOtpDto {
  @IsEmail()
  readonly email: string;

  @IsString()
  @Length(6)
  readonly otp: string;

  @IsEnum(OtpTypeEnum)
  readonly type: OtpTypeEnum;

  @IsOptional()
  @IsUUID()
  readonly bookStoreId?: string;
}
