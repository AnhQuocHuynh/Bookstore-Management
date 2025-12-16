import {
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

export class UpdateReturnOrderDetailDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  quantity?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  refundAmount?: number;

  @ValidateIf(
    (dto, value) => value !== undefined,
  )
  @IsUUID()
  @IsOptional()
  newProductId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

