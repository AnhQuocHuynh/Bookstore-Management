import { REDIS_PROVIDER_TOKEN } from '@/common/constants';
import { makeInjectableDecorator } from '@golevelup/nestjs-common';

export const InjectRedisClient = makeInjectableDecorator(REDIS_PROVIDER_TOKEN);
