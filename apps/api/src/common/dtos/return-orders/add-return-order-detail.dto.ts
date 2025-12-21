import { ReturnExchangeDetailType } from '@/common/enums';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

export class AddReturnOrderDetailDto {
  @IsEnum(ReturnExchangeDetailType)
  type: ReturnExchangeDetailType;

  @IsInt()
  @IsPositive()
  quantity: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  refundAmount: number;

  @ValidateIf((dto) => dto.type === ReturnExchangeDetailType.EXCHANGE)
  @IsUUID()
  newProductId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
