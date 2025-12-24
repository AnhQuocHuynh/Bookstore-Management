import z from "zod";

export const loginSchema = z
  .object({
    role: z
      .string()
      .refine((val) => ["admin", "owner", "employee"].includes(val), {
        message: "Vui lòng chọn vai trò",
      }),
    email: z.email("Email không hợp lệ").optional(),
    username: z.string().min(1, "Vui lòng nhập username").optional(),
    password: z.string().min(1, "Mật khẩu không được để trống").optional(),

    rememberMe: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === "admin" || data.role === "owner") {
      if (!data.email) {
        ctx.addIssue({
          path: ["email"],
          message: "Vui lòng nhập email",
          code: z.ZodIssueCode.custom,
        });
      }
      if (!data.password) {
        ctx.addIssue({
          path: ["password"],
          message: "Vui lòng nhập mật khẩu",
          code: z.ZodIssueCode.custom,
        });
      }
    }

    if (data.role === "employee") {
      if (!data.username) {
        ctx.addIssue({
          path: ["username"],
          message: "Vui lòng nhập username",
          code: z.ZodIssueCode.custom,
        });
      }
    }
  });
