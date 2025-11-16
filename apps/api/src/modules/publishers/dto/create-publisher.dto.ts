import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePublisherDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsOptional()
  @IsEmail()
  readonly email?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly phone?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly address?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly website?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly description?: string;
}
