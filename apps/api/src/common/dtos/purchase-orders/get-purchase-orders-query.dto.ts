import { IsNonEmptyString } from '@/common/decorators';
import { PurchaseStatus } from '@/common/enums';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetPurchaseOrdersQueryDto {
  @ApiPropertyOptional({
    description: 'ID của nhân viên thực hiện đơn mua',
    example: 'a3f0c89e-4c1c-4e7f-9b3d-6e4f07c8a1f0',
  })
  @IsOptional()
  @IsUUID()
  readonly employeeId?: string;

  @ApiPropertyOptional({
    description: 'Tên nhân viên (tìm kiếm gần đúng)',
    example: 'Nguyễn Văn A',
  })
  @IsOptional()
  @IsNonEmptyString({
    message: 'Tên của nhân viên không hợp lệ.',
  })
  readonly employeeName?: string;

  @ApiPropertyOptional({
    description: 'Trạng thái của đơn mua',
    enum: PurchaseStatus,
    example: PurchaseStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(PurchaseStatus, {
    message: 'Trạng thái đơn mua không hợp lệ.',
  })
  readonly status?: PurchaseStatus;
}
