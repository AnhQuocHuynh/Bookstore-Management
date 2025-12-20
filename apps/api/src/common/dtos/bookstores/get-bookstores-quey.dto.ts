import { IsNonEmptyString } from '@/common/decorators';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class GetBookStoresQueryDto {
  @ApiPropertyOptional({
    description: 'Token của OWNER/EMPLOYEE',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiT1dORVIiLCJlbWFpbCI6ImxlbmdvY2FuaHB5bmUzNjNAZ21haWwuY29tIiwiaWF0IjoxNzY1MjQwOTE1LCJleHAiOjE3NjUyNDQ1MTV9.9kTYQ90p2uqjUA7hUtfYzUgihomb1S3B-W1l3U12dW8',
  })
  @IsOptional()
  @IsNonEmptyString({
    message: 'Mã token không hợp lệ.',
  })
  readonly token?: string;
}
