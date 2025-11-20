import { DisplayLogActorType } from '@/common/enums';
import { TransformToDate } from '@/common/transformers';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class GetLogsQueryDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly displayShelfName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly productName?: string;

  @IsOptional()
  @IsUUID()
  readonly productId?: string;

  @IsOptional()
  @IsUUID()
  readonly actorId?: string;

  @IsOptional()
  @IsEnum(DisplayLogActorType)
  readonly type?: DisplayLogActorType;

  @IsOptional()
  @TransformToDate()
  readonly from?: Date;

  @IsOptional()
  @TransformToDate()
  readonly to?: Date;
}
