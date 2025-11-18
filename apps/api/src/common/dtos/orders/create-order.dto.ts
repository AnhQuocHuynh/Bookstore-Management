import { PaymentMethod } from '@/common/enums';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  readonly shippingAddress: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly note?: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('all', {
    each: true,
  })
  readonly cartItemsIds: string[];

  @IsEnum(PaymentMethod)
  readonly paymentMethod: PaymentMethod;
}
