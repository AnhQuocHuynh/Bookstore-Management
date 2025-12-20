import { InventoryLogAction } from '@/common/enums';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';

export class GetInventoryLogsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  readonly page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  readonly limit?: number = 10;

  @IsOptional()
  @IsUUID()
  readonly inventoryId?: string;

  @IsOptional()
  @IsUUID()
  readonly employeeId?: string;

  @IsOptional()
  @IsEnum(InventoryLogAction)
  readonly action?: InventoryLogAction;

  @IsOptional()
  @IsDateString()
  readonly fromDate?: string;

  @IsOptional()
  @IsDateString()
  readonly toDate?: string;
}
