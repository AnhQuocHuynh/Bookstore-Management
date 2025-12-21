import { z } from "zod";

export const forgetPasswordSchema = z
  .object({
    email: z.email("Email không hợp lệ"),
    otp: z.string().length(6, {
      message: "Mã xác thực không hợp lệ",
    }),
    password: z.string().min(8, "Mật khẩu mới phải có ít nhất 8 ký tự"),
    confirmPassword: z.string().min(8, "Mật khẩu mới xác nhận không khớp"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu mới xác nhận không khớp",
    path: ["confirmPassword"],
  });

export type ForgetPasswordFormValues = z.infer<typeof forgetPasswordSchema>;
