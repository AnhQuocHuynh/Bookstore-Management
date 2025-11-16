import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class CreateDatabaseConnectionDto {
  @IsString()
  @IsNotEmpty()
  readonly host: string;

  @IsNumber()
  @IsPositive()
  readonly port: number;

  @IsString()
  @IsNotEmpty()
  readonly username: string;

  @IsString()
  @IsNotEmpty()
  readonly password: string;

  @IsString()
  @IsNotEmpty()
  readonly databaseName: string;
}
