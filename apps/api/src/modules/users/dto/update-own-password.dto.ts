import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateOwnPasswordDto {
  @IsString()
  @IsNotEmpty()
  readonly token: string;

  @IsString()
  @IsNotEmpty()
  readonly currentPassword: string;

  @IsString()
  @IsNotEmpty()
  readonly newPassword: string;
}
