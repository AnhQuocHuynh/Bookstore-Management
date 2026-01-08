import { JWT_REFRESH_STRATEGY } from '@/common/constants';
import { ExecutionContext, GoneException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class RtGuard extends AuthGuard(JWT_REFRESH_STRATEGY) {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  handleRequest<TUser = any>(err: any, user: any): TUser {
    if (err || !user) {
      throw new GoneException('Refresh token không hợp lệ hoặc đã hết hạn.');
    }

    return user;
  }
}
