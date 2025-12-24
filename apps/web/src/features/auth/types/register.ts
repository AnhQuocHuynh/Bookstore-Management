import { registerSchema } from "@/features/auth/schema/register.schema";
import z from "zod";

export type RegisterFormValues = z.infer<typeof registerSchema>;
