import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateReturnOrderDto {
  @IsUUID()
  transactionId: string;

  @IsUUID()
  customerId: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
