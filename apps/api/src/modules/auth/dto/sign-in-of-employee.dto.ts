import { IsNonEmptyString } from '@/common/decorators';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SignInOfEmployeeDto {
  @ApiProperty({
    description: 'Tên đăng nhập của nhân viên',
    example: 'employee1232',
  })
  @IsNonEmptyString({
    message: 'Tên đăng nhập không hợp lệ.',
  })
  readonly username: string;
}
