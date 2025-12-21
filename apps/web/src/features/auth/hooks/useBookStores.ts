// src/features/auth/hooks/useBookStores.ts
import { useQuery } from "@tanstack/react-query";
import { bookstoreApi } from "../api/bookstore.api";
import { BookStore } from "../types/bookstore.types";

export const useBookStores = () => {
    return useQuery<BookStore[], Error>({
        queryKey: ["bookstores"],
        queryFn: bookstoreApi.getAll,
        staleTime: 5 * 60 * 1000, // 5 phút
        retry: 1,
    });
};