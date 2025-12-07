import { OtpTypeEnum } from '@/common/enums';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum } from 'class-validator';

export class ResendOtpDto {
  @ApiProperty({
    description: 'Email gửi kèm.',
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
    description: 'Loại xác thực OTP.',
    example: OtpTypeEnum.SIGN_UP,
  })
  @IsEnum(OtpTypeEnum, {
    message: 'Loại xác thực OTP không hợp lệ.',
  })
  readonly type: OtpTypeEnum;
}
