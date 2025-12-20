// Enums
export const OtpTypeEnum = {
  SIGN_UP: "sign_up",
  RESET_PASSWORD: "reset_password",
  CHANGE_PASSWORD: "change_password",
} as const;

export type OtpTypeEnum = (typeof OtpTypeEnum)[keyof typeof OtpTypeEnum];

// User Role Enum (from backend)
export const UserRole = {
  ADMIN: "ADMIN",
  OWNER: "OWNER",
  EMPLOYEE: "EMPLOYEE",
  STAFF: "STAFF",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

// Request DTOs
export interface SignInDto {
  email: string;
  password: string;
}

export interface CreateBookStoreDto {
  name: string;
  phoneNumber: string;
  address: string;
  logoUrl?: string;
}

export interface SignUpDto {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  birthDate: string; // ISO date string
  address: string;
  createBookStoreDto: CreateBookStoreDto;
}

export interface ForgetPasswordDto {
  email: string;
}

export interface VerifyOtpDto {
  email: string;
  otp: string;
  type: OtpTypeEnum;
}

export interface ResetPasswordDto {
  email: string;
  newPassword: string;
  authCode: string;
}

export interface ResendOtpDto {
  email: string;
  type: OtpTypeEnum;
}

// Response Types
export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  avatarUrl?: string | null;
  logoUrl?: string | null;
  birthDate?: string;
  address?: string | null;
  isActive: boolean;
  isEmailVerified: boolean;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  username?: string;
  isFirstLogin?: boolean;
}

export interface SignInResponse {
  accessToken?: string; // For ADMIN
  token?: string; // For OWNER
  profile: UserProfile;
}

export interface StoreInfo {
  id: string;
  name: string;
  code?: string;
  address?: string;
}

export interface ForgetPasswordResponse {
  message: string;
  stores?: StoreInfo[]; // Optional: List of stores if user has multiple stores
}

export interface VerifyOtpResponse {
  message: string;
  authCode?: string; // For reset password flow
  bookStoreId?: string; // For sign up flow
  storeCode?: string; // For sign up flow
}

export interface ResetPasswordResponse {
  message: string;
}

export interface ResendOtpResponse {
  message: string;
}

export interface SignUpResponse {
  message: string;
}
