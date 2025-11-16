import { OtpTypeEnum } from '@/common/enums';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  ValidateIf,
} from 'class-validator';

export class ResendOtpDto {
  @IsEmail()
  readonly email: string;

  @IsEnum(OtpTypeEnum)
  readonly type: OtpTypeEnum;

  @ValidateIf((e) => e.type === OtpTypeEnum.SIGN_UP)
  @IsString()
  @IsNotEmpty()
  readonly bookStoreId?: string;
}
