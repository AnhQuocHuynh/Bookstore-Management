import { z } from "zod";

export const changeFirstLoginPasswordSchema = z
  .object({
    password: z.string().min(8, "Mật khẩu mới phải có ít nhất 8 ký tự"),
    confirmPassword: z.string().min(8, "Mật khẩu mới xác nhận không khớp"),
    currentPassword: z.string().min(1, "Mật khẩu hiện tại không được để trống"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu mới xác nhận không khớp",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof changeFirstLoginPasswordSchema>;
