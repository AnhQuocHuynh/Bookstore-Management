import { DisplayLogAction } from '@/common/enums';
import { TransformToDate } from '@/common/transformers';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class GetLogsQueryDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly displayShelfName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly productName?: string;

  @IsOptional()
  @IsUUID()
  readonly productId?: string;

  @IsOptional()
  @IsEnum(DisplayLogAction)
  readonly action?: DisplayLogAction;

  @IsOptional()
  @IsUUID()
  readonly employeeId?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly employeeName?: string;

  @IsOptional()
  @TransformToDate()
  readonly from?: Date;

  @IsOptional()
  @TransformToDate()
  readonly to?: Date;
}
