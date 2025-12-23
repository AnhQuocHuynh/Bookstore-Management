import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class GetProductDetailQueryDto {
  @ApiPropertyOptional({
    description: 'Id của sản phẩm',
    example: '99c31ece-f824-4a34-a965-420c4c86b039',
  })
  @IsOptional()
  @IsUUID()
  readonly id?: string;

  @ApiPropertyOptional({
    description: 'Mã sku của sản phẩm.',
    example: 'product',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly sku?: string;
}
