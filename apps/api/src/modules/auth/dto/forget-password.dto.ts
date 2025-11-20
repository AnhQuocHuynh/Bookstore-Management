import { IsEmail } from 'class-validator';

export class ForgetPasswordDto {
  @IsEmail()
  readonly email!: string;
}
