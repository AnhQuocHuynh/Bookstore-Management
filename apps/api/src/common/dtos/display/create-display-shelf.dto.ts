import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDisplayShelfDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly description?: string;
}
