import { AuthorizationCodeTypeEnum } from '@/common/enums';
import { encryptPayload, hashPassword, verifyPassword } from '@/common/utils';
import { AuthorizationCode } from '@/database/main/entities';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';

@Injectable()
export class MainAuthorizationCodeService {
  constructor(
    @InjectRepository(AuthorizationCode)
    private readonly authorizationCodeRepo: Repository<AuthorizationCode>,
    private readonly configService: ConfigService,
  ) {}

  async createNewAuthozationCode(
    expiresAt: Date,
    type: AuthorizationCodeTypeEnum,
    userId: string,
  ) {
    const authCode = encryptPayload(crypto.randomUUID(), this.configService);
    const newRecord = this.authorizationCodeRepo.create({
      code: await hashPassword(authCode),
      user: {
        id: userId,
      },
      type,
      expiresAt,
    });
    await this.authorizationCodeRepo.save(newRecord);

    return {
      authCode,
    };
  }

  async checkIsValidAuthCode(
    authCode: string,
    userId: string,
    type: AuthorizationCodeTypeEnum,
  ) {
    const authCodes = await this.authorizationCodeRepo.find({
      where: {
        user: {
          id: userId,
        },
        type,
      },
    });

    for (const ac of authCodes) {
      if (
        (await verifyPassword(authCode, ac.code)) &&
        ac.expiresAt.getTime() > new Date().getTime()
      )
        return true;
    }

    return false;
  }

  async deleteAuthCodeByCode(authCode: string, userId: string) {
    const authCodes = await this.authorizationCodeRepo.find({
      where: {
        expiresAt: MoreThan(new Date()),
        user: {
          id: userId,
        },
      },
    });

    for (const ac of authCodes) {
      if (await verifyPassword(authCode, ac.code)) {
        await this.authorizationCodeRepo.delete({
          id: ac.id,
        });
        return;
      }
    }
  }
}
