import { PartialType } from '@nestjs/swagger'; // Dùng của swagger để hiện docs
import { CreateSupplierDto } from './create-supplier.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { SupplyStatus } from '@/common/enums'; // Import Enum trạng thái
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSupplierDto extends PartialType(CreateSupplierDto) {
    // Bổ sung thêm trường status
    @ApiPropertyOptional({
        description: 'Trạng thái nhà cung cấp (active | inactive)',
        enum: SupplyStatus,
        example: SupplyStatus.INACTIVE,
    })
    @IsOptional()
    @IsEnum(SupplyStatus, { message: 'Trạng thái không hợp lệ.' })
    readonly status?: SupplyStatus;
}