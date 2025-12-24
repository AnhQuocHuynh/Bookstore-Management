// src/features/auth/hooks/useBookStores.ts
import { useQuery } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";
import { BookStore } from "../types";

export const useBookStores = (token: string) => {
  return useQuery<BookStore[], Error>({
    queryKey: ["bookstores", token],
    queryFn: () => authApi.getBookStores(token),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};
