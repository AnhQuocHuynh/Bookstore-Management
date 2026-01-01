// src/features/auth/hooks/useBookStores.ts
import { BookStore } from "@/features/auth/types/bookstore.types";
import { useQuery } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";

export const useBookStores = (token?: string) => {
  return useQuery<BookStore[], Error>({
    queryKey: ["bookstores"],
    queryFn: () => authApi.getBookStores(token!),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
};
