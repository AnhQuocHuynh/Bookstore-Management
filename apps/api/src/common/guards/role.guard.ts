import { IS_PUBLIC_KEY, ROLES_KEY } from '@/common/decorators';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || isPublic) return true;

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user?.role)
      throw new UnauthorizedException('User not authenticated.');

    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole)
      throw new ForbiddenException(
        `You don't have permission to access this access this resource.`,
      );

    return hasRole;
  }
}
