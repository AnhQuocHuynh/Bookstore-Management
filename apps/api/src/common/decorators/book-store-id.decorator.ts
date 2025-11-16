import { TUserSession } from '@/common/utils/types';
import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { Request } from 'express';

export const BookStoreId = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const user = context.switchToHttp().getRequest<Request>()
      .user as TUserSession;

    if (!user?.bookStoreId?.trim())
      throw new BadRequestException('Bookstore ID is missing...');

    return user.bookStoreId;
  },
);
