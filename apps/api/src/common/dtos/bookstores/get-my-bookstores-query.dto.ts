import { Transform } from 'class-transformer';
import { IsBoolean, IsEmail, IsOptional } from 'class-validator';

export class GetMyBookStoresQueryDto {
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  readonly isActive?: boolean;

  @IsOptional()
  @IsEmail()
  readonly employeeEmail?: string;
}
