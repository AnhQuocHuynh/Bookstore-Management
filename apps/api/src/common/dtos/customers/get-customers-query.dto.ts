import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GetCustomersQueryDto {
  @ApiPropertyOptional({
    type: String,
    description: 'Số điện thoại cho phép tìm gần đúng',
    example: '03938',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  readonly phoneNumber?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Email, cho phép tìm gần đúng',
    example: 'lengoanh',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  readonly email?: string;
}
