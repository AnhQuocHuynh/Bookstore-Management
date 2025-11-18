import { IsNumber, IsOptional, IsPositive, IsUUID } from 'class-validator';

export class CreateDisplayProductDto {
  @IsNumber()
  @IsPositive()
  readonly quantity: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  readonly displayOrder?: number;

  @IsUUID()
  readonly bookId: string;

  @IsUUID()
  readonly displayShelfId: string;
}
