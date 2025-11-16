import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class VerifyInvitationQueryDto {
  @IsUUID()
  readonly bookStoreId: string;

  @IsString()
  @IsNotEmpty()
  readonly token: string;
}
