import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgetPasswordDto {
  @ApiProperty({
    description: 'Email không hợp lệ.',
    example: 'email123@gmail.com',
  })
  @IsEmail(
    {},
    {
      message: 'Email không hợp lệ.',
    },
  )
  readonly email!: string;
}
