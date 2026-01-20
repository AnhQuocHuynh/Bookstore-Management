import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsVietnamesePhoneNumber(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsVietnamesePhoneNumber',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') return false;

          const regex = /^(?:\+84|0)(3|5|7|8|9)\d{8}$/;
          return regex.test(value);
        },
      },
    });
  };
}
