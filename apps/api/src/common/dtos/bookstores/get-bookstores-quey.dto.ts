import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GetBookStoresQueryDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly token?: string;
}
