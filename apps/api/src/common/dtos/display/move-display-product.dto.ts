import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class MoveDisplayProductDto {
  @ApiProperty({
    description: 'Mã ID của kệ cần chuyển đến',
    example: 'id-1',
  })
  @IsUUID('4', {
    message: 'Mã ID của kệ cần chuyển đến không hợp lệ',
  })
  readonly targetShelfId: string;

  @ApiPropertyOptional({
    description:
      'Số lượng cần chuyển (nếu có), nếu không truyền vào thì mặc định là chuyển toàn bộ.',
    example: 10,
  })
  @IsOptional()
  @IsInt({
    message: 'Số lượng cần chuyển phải là số nguyên',
  })
  @Min(1, {
    message: 'Số lượng cần chuyển phải ít nhất là 1',
  })
  readonly quantity?: number;
}
