import { z } from "zod";

export const securitySettingsSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "Mật khẩu hiện tại là bắt buộc")
      .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    newPassword: z
      .string()
      .min(1, "Mật khẩu mới là bắt buộc")
      .min(6, "Mật khẩu mới phải có ít nhất 6 ký tự")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Mật khẩu phải chứa chữ hoa, chữ thường và số"
      ),
    confirmPassword: z
      .string()
      .min(1, "Xác nhận mật khẩu là bắt buộc"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export type SecuritySettingsFormData = z.infer<typeof securitySettingsSchema>;
