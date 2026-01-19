import { IsNonEmptyString } from '@/common/decorators';
import { ReturnOrderStatus } from '@/common/enums';
import {
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsDateString,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetReturnOrdersQueryDto {
  @ApiPropertyOptional({
    description: 'Trạng thái đơn trả hàng',
    enum: ReturnOrderStatus,
    example: ReturnOrderStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(ReturnOrderStatus)
  readonly status?: ReturnOrderStatus;

  @ApiPropertyOptional({
    description: 'Tên nhân viên xử lý đơn trả hàng',
    example: 'Nguyễn Văn A',
  })
  @IsOptional()
  @IsNonEmptyString()
  readonly employeeName?: string;

  @ApiPropertyOptional({
    description: 'Email nhân viên xử lý đơn trả hàng',
    example: 'employee@example.com',
  })
  @IsOptional()
  @IsEmail()
  readonly employeeEmail?: string;

  @ApiPropertyOptional({
    description: 'Email khách hàng',
    example: 'customer@example.com',
  })
  @IsOptional()
  @IsEmail()
  readonly customerEmail?: string;

  @ApiPropertyOptional({
    description: 'Tên khách hàng',
    example: 'Trần Thị B',
  })
  @IsOptional()
  @IsNonEmptyString()
  readonly customerName?: string;

  @ApiPropertyOptional({
    description: 'Tổng tiền hoàn tối đa',
    example: 500000,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  readonly maxTotalRefundAmount?: number;

  @ApiPropertyOptional({
    description: 'Tổng tiền hoàn tối thiểu',
    example: 100000,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  readonly minTotalRefundAmount?: number;

  @ApiPropertyOptional({
    description: 'Thời gian tạo từ (ISO 8601)',
    example: '2026-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  readonly fromCreatedAt?: string;

  @ApiPropertyOptional({
    description: 'Thời gian tạo đến (ISO 8601)',
    example: '2026-01-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString()
  readonly toCreatedAt?: string;
}
