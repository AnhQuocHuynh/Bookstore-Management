import { UserRole } from '@/modules/users/enums';

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
