import { z } from "zod";

export const registerSchema = z
  .object({
    storeName: z.string().min(1, "Vui lòng nhập tên nhà sách"),
    storePhoneNumber: z
      .string()
      .min(1, "Vui lòng nhập số điện thoại nhà sách")
      .regex(/^\+?[0-9]+$/, "Số điện thoại không hợp lệ"),
    storeAddress: z.string().min(1, "Vui lòng nhập địa chỉ nhà sách"),
    fullName: z.string().min(1, "Vui lòng nhập họ và tên"),
    email: z.string().email("Email không hợp lệ"),
    phoneNumber: z
      .string()
      .min(1, "Vui lòng nhập số điện thoại")
      .regex(/^\+?[0-9]+$/, "Số điện thoại không hợp lệ"),
    birthDate: z.string().min(1, "Vui lòng chọn ngày sinh"),
    address: z.string().min(1, "Vui lòng nhập địa chỉ"),
    password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
    confirmPassword: z.string().min(8, "Mật khẩu xác nhận không khớp"),
    agreeTerms: z.boolean().refine((v) => v, {
      message: "Bạn cần đồng ý với Điều khoản & Chính sách",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
