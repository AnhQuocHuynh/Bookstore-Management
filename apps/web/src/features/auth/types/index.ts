import { EmployeeRole, UserRole } from "@bookstore/types";

// Enums
export const OtpTypeEnum = {
  SIGN_UP: "sign_up",
  RESET_PASSWORD: "reset_password",
  CHANGE_PASSWORD: "change_password",
} as const;

export type OtpTypeEnum = (typeof OtpTypeEnum)[keyof typeof OtpTypeEnum];

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

export interface EmployeeProfile {
  username: string;
  isFirstLogin: boolean;
  employeeCode: string;
  role: EmployeeRole;
}

// Response Types
export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  avatarUrl: string;
  birthDate: string;
  address: string;
  isActive: boolean;
  isEmailVerified: boolean;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  employeeProfile?: EmployeeProfile;
}

export interface SignInResponse {
  accessToken?: string; // For ADMIN
  token?: string; // For OWNER
  profile: any;
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
