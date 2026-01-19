import { z } from "zod";

export const hrSettingsSchema = z.object({
  baseSalary: z
    .number()
    .min(0, "Lương cơ bản không được âm")
    .max(1000000000, "Lương cơ bản không hợp lệ"),
  morningShiftStart: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Định dạng giờ không hợp lệ (HH:mm)"),
  morningShiftEnd: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Định dạng giờ không hợp lệ (HH:mm)"),
  afternoonShiftStart: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Định dạng giờ không hợp lệ (HH:mm)"),
  afternoonShiftEnd: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Định dạng giờ không hợp lệ (HH:mm)"),
  eveningShiftStart: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Định dạng giờ không hợp lệ (HH:mm)"),
  eveningShiftEnd: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Định dạng giờ không hợp lệ (HH:mm)"),
});

export type HRSettingsFormData = z.infer<typeof hrSettingsSchema>;
