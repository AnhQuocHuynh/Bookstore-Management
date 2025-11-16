import { PHONE_NUMBER_REGEX } from '@/common/constants';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsVietnamesePhoneNumber(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isVietnamesePhoneNumber',
      target: object.constructor,
      propertyName,
      options: {
        message: 'Số điện thoại không hợp lệ.',
        ...validationOptions,
      },
      validator: {
        validate(value: any, _args: ValidationArguments) {
          if (typeof value !== 'string') return false;
          return PHONE_NUMBER_REGEX.test(value.trim());
        },
      },
    });
  };
}
