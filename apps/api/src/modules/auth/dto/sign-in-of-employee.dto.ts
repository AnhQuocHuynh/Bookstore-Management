import { IsNotEmpty, IsString } from 'class-validator';

export class SignInOfEmployeeDto {
  @IsString()
  @IsNotEmpty()
  readonly username: string;
}
