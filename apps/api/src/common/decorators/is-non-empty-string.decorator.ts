import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsNonEmptyString(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isNonEmptyString',
      target: object.constructor,
      propertyName,
      options: {
        message: 'Trường này phải là chuỗi và không được để trống.',
        ...validationOptions,
      },
      validator: {
        validate(value: any, _args: ValidationArguments) {
          return typeof value === 'string' && value.trim().length > 0;
        },
      },
    });
  };
}
