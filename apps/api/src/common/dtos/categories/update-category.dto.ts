import { PartialType } from '@nestjs/swagger';
import { CreateCategoryDto } from './create-category.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { CategoryStatus } from '@/common/enums'; // Import Enum trạng thái
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
    // Bổ sung thêm trường status
    @ApiPropertyOptional({
        description: 'Trạng thái danh mục (active | inactive)',
        enum: CategoryStatus,
        example: CategoryStatus.ACTIVE,
    })
    @IsOptional()
    @IsEnum(CategoryStatus, { message: 'Trạng thái danh mục không hợp lệ.' })
    readonly status?: CategoryStatus;
}