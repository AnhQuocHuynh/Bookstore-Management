import { OtpTypeEnum } from '@/common/enums';
import { IsEmail, IsEnum } from 'class-validator';

export class ResendOtpDto {
  @IsEmail()
  readonly email: string;

  @IsEnum(OtpTypeEnum)
  readonly type: OtpTypeEnum;
}
