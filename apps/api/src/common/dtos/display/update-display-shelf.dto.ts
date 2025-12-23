import { IsNonEmptyString } from '@/common/decorators';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateDisplayShelfDto {
  @ApiPropertyOptional({
    description: 'Tên của kệ',
    example: 'Kệ mới',
  })
  @IsOptional()
  @IsNonEmptyString({
    message: 'Tên của kệ không hợp lệ.',
  })
  readonly name?: string;

  @ApiPropertyOptional({
    description: 'Mô tả cho kệ',
    example: 'Mô tả mới',
  })
  @IsOptional()
  @IsNonEmptyString({
    message: 'Mô tả của kệ không hợp lệ.',
  })
  readonly description?: string;
}
