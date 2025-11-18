import { IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class MoveDisplayProductDto {
  @IsUUID()
  readonly targetShelfId: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  readonly quantity?: number;
}
