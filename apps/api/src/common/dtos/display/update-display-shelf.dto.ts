import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateDisplayShelfDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly description?: string;
}
