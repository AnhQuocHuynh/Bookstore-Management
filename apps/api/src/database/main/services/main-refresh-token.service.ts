import { decryptPayload, encryptPayload } from '@/common/utils';
import { RefreshToken } from '@/database/main/entities';
import { UserRole } from '@/modules/users/enums';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';

@Injectable()
export class MainRefreshTokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async findRefreshTokenByUserId(userId: string) {
    return this.refreshTokenRepo.find({
      where: {
        user: {
          id: userId,
        },
      },
    });
  }

  async findValidRefreshTokenByUserIdAndToken(userId: string, token: string) {
    const existingRefreshTokens = await this.refreshTokenRepo.find({
      where: {
        user: {
          id: userId,
        },
        expiresAt: MoreThan(new Date()),
      },
    });

    if (existingRefreshTokens.length < 0) return null;

    for (const rt of existingRefreshTokens) {
      const decryptToken = decryptPayload(rt.token, this.configService);
      if (
        typeof decryptToken === 'string' &&
        decryptToken === token &&
        rt.expiresAt.getTime() > new Date().getTime() &&
        !rt.isRevoked
      )
        return rt;
    }

    return null;
  }

  async updateRefreshToken(id: string, data: Partial<RefreshToken>) {
    await this.refreshTokenRepo.update({ id }, data);
  }

  async createNewRefreshToken(payload: {
    userId: string;
    role: UserRole;
    bookStoreId?: string;
  }) {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt_refresh_secret'),
      expiresIn: this.configService.get('jwt_refresh_expiration_time', '7d'),
    });
    const newRefreshToken = this.refreshTokenRepo.create({
      token: encryptPayload(refreshToken, this.configService),
      user: {
        id: payload.userId,
      },
      expiresAt,
    });

    await this.refreshTokenRepo.save(newRefreshToken);

    return {
      refreshToken,
    };
  }
}
