import { IsNonEmptyString } from '@/common/decorators';
import { DisplayLogAction } from '@/common/enums';
import { TransformToDate } from '@/common/transformers';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsEnum, IsOptional, IsUUID } from 'class-validator';

export class GetLogsQueryDto {
  @ApiPropertyOptional({
    description: 'Tên của kệ',
    example: 'Kệ 1',
  })
  @IsOptional()
  @IsNonEmptyString({
    message: 'Tên của kệ không hợp lệ',
  })
  readonly displayShelfName?: string;

  @ApiPropertyOptional({
    description: 'Tên sản phẩm',
    example: 'Sản phẩm 1',
  })
  @IsOptional()
  @IsNonEmptyString({
    message: 'Tên sản phẩm không hợp lệ',
  })
  readonly productName?: string;

  @ApiPropertyOptional({
    description: 'Mã ID của sản phẩm',
    example: 'id-1',
  })
  @IsOptional()
  @IsUUID('all', {
    message: 'Mã ID sản phẩm không hợp lệ',
  })
  readonly productId?: string;

  @ApiPropertyOptional({
    description: 'Hành động thực hiện',
    example: DisplayLogAction.MOVE,
  })
  @IsOptional()
  @IsEnum(DisplayLogAction, {
    message: 'Hành động thực hiện không hợp lệ',
  })
  readonly action?: DisplayLogAction;

  @ApiPropertyOptional({
    description: 'Mã ID của nhân viên',
    example: 'id-1',
  })
  @IsOptional()
  @IsUUID('all', {
    message: 'Mã ID nhân viên không hợp lệ',
  })
  readonly employeeId?: string;

  @ApiPropertyOptional({
    description: 'Họ và tên nhân viên',
    example: 'Lê Văn Nam',
  })
  @IsOptional()
  @IsNonEmptyString({
    message: 'Họ và tên nhân viên không hợp lệ',
  })
  readonly employeeName?: string;

  @ApiPropertyOptional({
    description: 'Ngày bắt đầu lọc',
    example: '2025-08-20',
  })
  @IsOptional()
  @TransformToDate()
  @IsDate({
    message: 'Ngày bắt đầu lọc không hợp lệ',
  })
  readonly from?: Date;

  @ApiPropertyOptional({
    description: 'Ngày kết thúc lọc',
    example: '2025-08-25',
  })
  @IsOptional()
  @TransformToDate()
  @IsDate({
    message: 'Ngày kết thúc lọc không hợp lệ',
  })
  readonly to?: Date;
}
