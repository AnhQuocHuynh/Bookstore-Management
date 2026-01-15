import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetAuthorsQueryDto {
  @ApiPropertyOptional({
    description: 'Từ khóa tìm kiếm (Tên tác giả hoặc bút danh)',
    example: 'Nguyễn Nhật Ánh',
  })
  @IsOptional()
  @IsString()
  readonly keyword?: string;
}
