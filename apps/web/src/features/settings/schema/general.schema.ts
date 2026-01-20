import { z } from "zod";

export const generalSettingsSchema = z.object({
  storeName: z
    .string()
    .min(1, "Tên cửa hàng là bắt buộc")
    .max(100, "Tên cửa hàng không được quá 100 ký tự"),
  logoUrl: z.string().optional(),
  contactPhone: z
    .string()
    .min(10, "Số điện thoại phải có ít nhất 10 số")
    .max(15, "Số điện thoại không được quá 15 số")
    .regex(/^[0-9+\-\s()]*$/, "Số điện thoại không hợp lệ"),
  contactEmail: z
    .string()
    .email("Email không hợp lệ")
    .min(1, "Email là bắt buộc"),
  address: z
    .string()
    .min(5, "Địa chỉ phải có ít nhất 5 ký tự")
    .max(200, "Địa chỉ không được quá 200 ký tự"),
});

export type GeneralSettingsFormData = z.infer<typeof generalSettingsSchema>;
