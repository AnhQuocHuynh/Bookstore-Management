import { JWT_REFRESH_STRATEGY } from '@/common/constants';
import { decryptPayload } from '@/common/utils';
import { JwtTokenPayload } from '@/common/utils/types';
import { MainRefreshTokenService } from '@/database/main/services/main-refresh-token.service';
import { RT } from '@/database/tenant/entities';
import { UserRole } from '@/modules/users/enums';
import { TenantService } from '@/tenants/tenant.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { MoreThan } from 'typeorm';

@Injectable()
export class RtStrategy extends PassportStrategy(
  Strategy,
  JWT_REFRESH_STRATEGY,
) {
  constructor(
    private readonly config: ConfigService,
    private readonly tenantService: TenantService,
    private readonly mainRefreshTokenService: MainRefreshTokenService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          const rt = req?.cookies?.refreshToken;
          if (!rt) return null;
          return rt;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('jwt_refresh_secret', ''),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtTokenPayload) {
    const refreshToken = req.cookies?.refreshToken;
    const { userId, role, bookStoreId } = payload;

    const validRefreshToken =
      !bookStoreId?.trim() || role === UserRole.OWNER
        ? await this.mainRefreshTokenService.findValidRefreshTokenByUserIdAndToken(
            userId,
            refreshToken,
          )
        : await this.getRefreshTokenTenant(bookStoreId, userId, refreshToken);

    if (!validRefreshToken)
      throw new UnauthorizedException(
        'Your refresh token has expired. Please login again.',
      );

    return { userId, role, ...(bookStoreId?.trim() && { bookStoreId }) };
  }

  private async getRefreshTokenTenant(
    bookStoreId: string,
    userId: string,
    token: string,
  ) {
    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });
    const refreshTokenRepo = dataSource.getRepository(RT);

    const existingRefreshTokens = await refreshTokenRepo.find({
      where: {
        user: {
          id: userId,
        },
        expiresAt: MoreThan(new Date()),
      },
    });

    if (existingRefreshTokens.length < 0) return null;

    for (const rt of existingRefreshTokens) {
      const decryptToken = decryptPayload(rt.token, this.config);
      if (
        typeof decryptToken === 'string' &&
        decryptToken === token &&
        !rt.isRevoked &&
        rt.expiresAt.getTime() > new Date().getTime()
      )
        return rt;
    }

    return null;
  }
}
