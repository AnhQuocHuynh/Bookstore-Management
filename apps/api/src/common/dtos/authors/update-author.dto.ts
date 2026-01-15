import { PartialType } from '@nestjs/swagger';
import { CreateAuthorDto } from './create-author.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { AuthorStatus } from '@/common/enums';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAuthorDto extends PartialType(CreateAuthorDto) {
  @ApiPropertyOptional({
    description: 'Trạng thái tác giả',
    enum: AuthorStatus,
    example: AuthorStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(AuthorStatus, { message: 'Trạng thái không hợp lệ' })
  readonly status?: AuthorStatus;
}
