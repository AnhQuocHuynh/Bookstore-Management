import { REDIS_PROVIDER_TOKEN } from '@/common/constants';
import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const RedisClient: Provider = {
  provide: REDIS_PROVIDER_TOKEN,
  useFactory: (configService: ConfigService) => {
    return new Redis(configService.get<string>('redis_url', ''));
  },
  inject: [ConfigService],
};
