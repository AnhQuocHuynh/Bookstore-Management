import { ALGORITHM, CHARS, IV_LENGTH } from '@/common/constants';
import { ConfigService } from '@nestjs/config';
import * as bcryptjs from 'bcryptjs';
import crypto from 'crypto';
import { addDays } from 'date-fns';
import Decimal from 'decimal.js';
import { CookieOptions, Response } from 'express';

export async function hashPassword(password: string): Promise<string> {
  return bcryptjs.hash(password, bcryptjs.genSaltSync());
}

export async function verifyPassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcryptjs.compare(password, hashedPassword);
}

export const buildCryptoSecretKey = (configService: ConfigService) => {
  return crypto
    .createHash('sha256')
    .update(
      configService.get<string>('crypto_secret_key') || 'default_secret_key',
    )
    .digest();
};

export function encryptPayload(payload: any, configService: ConfigService) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const SECRET_KEY = buildCryptoSecretKey(configService);
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);
  const json = JSON.stringify(payload);
  const encrypted = Buffer.concat([
    cipher.update(json, 'utf8'),
    cipher.final(),
  ]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decryptPayload(
  encryptedData: string,
  configService: ConfigService,
) {
  const [ivHex, encryptedHex] = encryptedData.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const encryptedText = Buffer.from(encryptedHex, 'hex');
  const SECRET_KEY = buildCryptoSecretKey(configService);
  const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);
  const decrypted = Buffer.concat([
    decipher.update(encryptedText),
    decipher.final(),
  ]);
  return JSON.parse(decrypted.toString('utf8'));
}

export function generateStoreCode(storeName: string): string {
  if (!storeName || typeof storeName !== 'string') {
    throw new Error('Invalid store name.');
  }

  const normalized = storeName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase();

  const randomSuffix = crypto.randomBytes(2).toString('hex').toUpperCase();

  const prefix = normalized.slice(0, 6);

  return `${prefix}-${randomSuffix}`;
}

export function generateOtp(length = 6) {
  const min = 10 ** (length - 1);
  const max = 10 ** length - 1;
  const otp = Math.floor(Math.random() * (max - min + 1)) + min;
  return otp.toString();
}

export function setCookie(
  res: Response,
  name: string,
  value: string,
  maxAge: number,
  configService: ConfigService,
  options?: Partial<CookieOptions>,
) {
  const isProd = configService.get<string>('node_env') === 'production';
  res.cookie(name, value, {
    secure: isProd,
    sameSite: 'strict',
    maxAge,
    path: '/',
    ...options,
  });
}

export function generateSecureToken(sizeBytes = 32) {
  const buf = crypto.randomBytes(sizeBytes);
  return buf
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function hashTokenSHA256(token: string): string {
  return crypto.createHash('sha256').update(token, 'utf8').digest('hex');
}

export function verifyToken(rawToken: string, hashedToken: string) {
  const hashedRaw = hashTokenSHA256(rawToken);
  if (hashedRaw.length !== hashedToken.length) return false;
  return crypto.timingSafeEqual(
    Buffer.from(hashedRaw, 'hex'),
    Buffer.from(hashedToken, 'hex'),
  );
}

export function assignDefined<T>(target: T, source: Partial<T>): T {
  Object.entries(source).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      (target as any)[key] = value;
    }
  });
  return target;
}

export function calculateMoney(...values: (string | number)[]): number {
  return values
    .reduce((acc, val) => acc.plus(new Decimal(val)), new Decimal(0))
    .toNumber();
}

export function generateUsername(fullName: string, birthDate: string): string {
  const normalized = fullName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  const names = normalized.split(' ').filter((n) => n.length > 0);
  if (names.length === 0) return '';

  const lastName = names[names.length - 1];
  const initials = names
    .slice(0, -1)
    .map((n) => n[0])
    .join('');
  let username = lastName + initials;

  const datePart = birthDate.replace(/-/g, '').substring(0, 6);
  username += datePart;

  const chars = CHARS.split('');
  const randomLength = Math.floor(Math.random() * 2) + 5;

  for (let i = 0; i < randomLength; i++) {
    const randomChar = chars[Math.floor(Math.random() * chars.length)];
    username += randomChar;
  }

  return username;
}

export function generateSecurePassword(length = 12) {
  let password = '';
  for (let i = 0; i < length; i++) {
    const index = crypto.randomInt(0, CHARS.length);
    password += CHARS[index];
  }
  return password;
}
