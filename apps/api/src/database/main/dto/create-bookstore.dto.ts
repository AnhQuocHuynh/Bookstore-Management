import { IsVietnamesePhoneNumber } from '@/common/decorators';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBookStoreDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsVietnamesePhoneNumber()
  readonly phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  readonly address: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly logoUrl?: string;
}
