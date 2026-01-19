import { z } from "zod";

export const salesSettingsSchema = z.object({
  taxRate: z
    .number()
    .min(0, "Thuế suất không được âm")
    .max(100, "Thuế suất không được quá 100%"),
  receiptFooter: z
    .string()
    .max(500, "Chân trang hóa đơn không được quá 500 ký tự")
    .optional(),
  enableCash: z.boolean(),
  enableCard: z.boolean(),
  enableBankTransfer: z.boolean(),
  enableMomo: z.boolean(),
  enableZaloPay: z.boolean(),
});

export type SalesSettingsFormData = z.infer<typeof salesSettingsSchema>;
