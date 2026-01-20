import { z } from "zod";

export const hrSettingsSchema = z.object({
  baseSalary: z
    .number()
    .min(0, "Lương cơ bản không được âm")
    .max(1000000000, "Lương cơ bản không hợp lệ"),
});

export type HRSettingsFormData = z.infer<typeof hrSettingsSchema>;
