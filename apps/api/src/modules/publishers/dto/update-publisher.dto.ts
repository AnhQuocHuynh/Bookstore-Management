import { PartialType } from '@nestjs/swagger'; // Sử dụng từ @nestjs/swagger để hỗ trợ docs
import { CreatePublisherDto } from './create-publisher.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { PublisherStatus } from '@/common/enums'; // Import Enum trạng thái
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePublisherDto extends PartialType(CreatePublisherDto) {
    // Bổ sung thêm trường status
    @ApiPropertyOptional({
        description: 'Trạng thái nhà xuất bản (active | inactive)',
        enum: PublisherStatus,
        example: PublisherStatus.ACTIVE,
    })
    @IsOptional()
    @IsEnum(PublisherStatus, { message: 'Trạng thái không hợp lệ.' })
    readonly status?: PublisherStatus;
}