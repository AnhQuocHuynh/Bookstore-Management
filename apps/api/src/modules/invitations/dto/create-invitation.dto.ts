import { IsEmail } from 'class-validator';

export class CreateInvitationDto {
  @IsEmail()
  readonly email: string;
}
