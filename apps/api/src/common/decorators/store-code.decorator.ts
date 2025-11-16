import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const StoreCode = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.cookies?.storeCode || null;
  },
);
