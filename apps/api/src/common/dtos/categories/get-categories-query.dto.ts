import { CategoryStatus } from '@/common/enums';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsUUID, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetCategoriesQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({
    description: 'Số trang hiện tại',
    // example: 1,
  })
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({
    description: 'Số lượng item mỗi trang',
    // example: 10,
  })
  limit?: number;

  @IsOptional()
  @IsEnum(CategoryStatus)
  @ApiPropertyOptional({
    enum: CategoryStatus,
    description: 'Trạng thái danh mục (active | inactive)',
  })
  status?: CategoryStatus;

  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({
    description: 'Lọc danh mục con theo ID danh mục cha',
    // Đã xóa dòng example: 'uuid-string' để tránh lỗi
  })
  parentId?: string;

  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({
    description: 'ID của cửa hàng (Bắt buộc nếu là Khách hàng/Vãng lai)',
    example: '99c31ece-f824-4a34-a965-420c4c86b039',
  })
  bookStoreId?: string;
}