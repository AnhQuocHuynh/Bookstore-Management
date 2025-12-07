import { OtpTypeEnum } from '@/common/enums';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString, Length } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({
    description: 'Email xác thực',
    example: 'email123@gmail.com',
  })
  @IsEmail(
    {},
    {
      message: 'Email không hợp lệ.',
    },
  )
  readonly email: string;

  @ApiProperty({
    description: 'Mã OTP',
    example: '123456',
  })
  @IsString({
    message: 'Mã OTP không được để trống.',
  })
  @Length(6, 6, {
    message: 'Mã OTP không hợp lệ.',
  })
  readonly otp: string;

  @ApiProperty({
    description: 'Loại xác thực OTP',
    example: OtpTypeEnum.SIGN_UP,
  })
  @IsEnum(OtpTypeEnum)
  readonly type: OtpTypeEnum;
}
