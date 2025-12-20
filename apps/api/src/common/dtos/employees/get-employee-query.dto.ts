import {
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  IsNotEmpty,
} from 'class-validator';

export class GetEmployeeQueryDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsOptional()
  @IsEmail()
  @IsNotEmpty()
  email?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  username?: string;
}
