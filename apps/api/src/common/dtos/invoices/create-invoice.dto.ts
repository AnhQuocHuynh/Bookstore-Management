import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateInvoiceDto {
  @IsNumber()
  @IsPositive()
  readonly taxRate: number;

  @IsNumber()
  @IsPositive()
  readonly taxAmount: number;

  @IsNumber()
  @IsPositive()
  readonly totalWithTax: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly note?: string;

  @IsUUID()
  readonly orderId: string;
}
