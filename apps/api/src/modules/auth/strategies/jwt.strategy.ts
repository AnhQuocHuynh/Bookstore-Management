import { JWT_STRATEGY } from '@/common/constants';
import { JwtTokenPayload } from '@/common/utils/types';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, JWT_STRATEGY) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt_secret', ''),
    });
  }

  async validate(payload: JwtTokenPayload) {
    const { userId, role, bookStoreId } = payload;
    return {
      userId,
      role,
      ...(bookStoreId?.trim() && { bookStoreId }),
    };
  }
}
