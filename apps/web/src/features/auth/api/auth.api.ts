import { apiClient } from "@/lib/axios";
import type {
  SignInDto,
  SignInResponse,
  ForgetPasswordDto,
  ForgetPasswordResponse,
  VerifyOtpDto,
  VerifyOtpResponse,
  ResetPasswordDto,
  ResetPasswordResponse,
  ResendOtpDto,
  ResendOtpResponse,
} from "../types";

/**
 * Authentication API Service
 * Handles all authentication-related API calls
 */
export const authApi = {
  /**
   * Sign in to the system (for bookstore owner or admin)
   * @param body - Sign in credentials
   * @returns Sign in response with token and user profile
   */
  login: async (body: SignInDto): Promise<SignInResponse> => {
    const response = await apiClient.post<SignInResponse>(
      "/auth/sign-in",
      body,
    );
    return response.data;
  },

  /**
   * Check email and send OTP for forgot password flow
   * This is step 1 of the forgot password process
   * @param email - User email address
   * @returns Response with success message
   */
  checkEmail: async (email: string): Promise<ForgetPasswordResponse> => {
    const response = await apiClient.post<ForgetPasswordResponse>(
      "/auth/forget-password",
      { email } as ForgetPasswordDto,
    );
    return response.data;
  },

  /**
   * Send OTP to user's email
   * Used for resending OTP in forgot password or other flows
   * @param body - Resend OTP request with email and type
   * @returns Response with success message
   */
  sendOtp: async (body: ResendOtpDto): Promise<ResendOtpResponse> => {
    const response = await apiClient.post<ResendOtpResponse>(
      "/auth/resend-otp",
      body,
    );
    return response.data;
  },

  /**
   * Verify OTP code
   * Used in forgot password flow (step 2) and other OTP verification flows
   * @param body - OTP verification request
   * @returns Response with message and optional authCode (for reset password) or store info (for sign up)
   */
  verifyOtp: async (body: VerifyOtpDto): Promise<VerifyOtpResponse> => {
    const response = await apiClient.post<VerifyOtpResponse>(
      "/auth/verify-otp",
      body,
    );
    return response.data;
  },

  /**
   * Reset password after OTP verification
   * This is step 3 of the forgot password process
   * Requires authCode from verifyOtp response
   * @param body - Reset password request with email, new password, and auth code
   * @returns Response with success message
   */
  resetPassword: async (
    body: ResetPasswordDto,
  ): Promise<ResetPasswordResponse> => {
    const response = await apiClient.post<ResetPasswordResponse>(
      "/auth/reset-password",
      body,
    );
    return response.data;
  },
};
