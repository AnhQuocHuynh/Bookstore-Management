import { OtpTypeEnum } from '@/common/enums';
import { encryptPayload, generateOtp } from '@/common/utils';
import { Otp } from '@/database/main/entities';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, MoreThan, Repository } from 'typeorm';

@Injectable()
export class MainOtpService {
  constructor(
    @InjectRepository(Otp) private readonly otpRepo: Repository<Otp>,
    private readonly configService: ConfigService,
  ) {}

  async createNewOtp(
    length = 6,
    userId: string,
    expiresAt: Date,
    type: OtpTypeEnum,
    metadata?: Record<string, any>,
    manager?: EntityManager,
  ) {
    const repo = manager ? manager.getRepository(Otp) : this.otpRepo;
    const otp = generateOtp(length);
    const otpRecord = repo.create({
      otp: encryptPayload(otp, this.configService),
      user: {
        id: userId,
      },
      type,
      expiresAt,
      ...(metadata && {
        metadata,
      }),
    });
    await repo.save(otpRecord);
    return {
      otp,
    };
  }

  async findOtpsByUserIdAndType(userId: string, type: OtpTypeEnum) {
    return this.otpRepo.find({
      where: {
        user: {
          id: userId,
        },
        type,
        expiresAt: MoreThan(new Date()),
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async deleteOtpById(id: string) {
    await this.otpRepo.delete({ id });
  }
}
