import { UserRole } from '@/modules/users/enums';
import Redis from 'ioredis';

export type JwtTokenPayload = {
  userId: string;
  role: UserRole;
  bookStoreId?: string;
  iat: number;
  exp: number;
};

export type TUserSession = {
  userId: string;
  role: UserRole;
  bookStoreId?: string;
};

export type RedisClient = Redis;

export type RawTenantConfig = {
  type: string;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
};
