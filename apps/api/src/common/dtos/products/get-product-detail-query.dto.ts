import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class GetProductDetailQueryDto {
  @IsOptional()
  @IsUUID()
  readonly id?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly sku?: string;
}
