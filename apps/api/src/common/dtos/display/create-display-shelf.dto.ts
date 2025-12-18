import { IsNonEmptyString } from '@/common/decorators';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class CreateDisplayShelfDto {
  @ApiProperty({
    description: 'Tên của kệ',
    example: 'Kệ 1',
  })
  @IsNonEmptyString({
    message: 'Tên của kệ không hợp lệ',
  })
  readonly name: string;

  @ApiPropertyOptional({
    description: 'Mô tả cho kệ (tuỳ chọn)',
    example: 'Mô tả cho kệ 1',
  })
  @IsOptional()
  @IsNonEmptyString({
    message: 'Mô tả cho kệ không hợp lệ',
  })
  readonly description?: string;
}
