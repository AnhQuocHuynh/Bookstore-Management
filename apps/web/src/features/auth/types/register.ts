import { registerSchema } from "@/features/auth/schema/register.schema";
import z from "zod";

export type RegisterFormValues = z.infer<typeof registerSchema>;

export type CreateBookStoreDto = {
  name: string;
  phoneNumber: string;
  address: string;
  logoUrl?: string;
};

export type RegisterDto = {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  birthDate: string;
  address: string;
  createBookStoreDto: CreateBookStoreDto;
};
