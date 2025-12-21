// src/features/auth/api/bookstore.api.ts
import { apiClient } from "@/lib/axios";
import { BookStore } from "../types/bookstore.types";

// export const bookstoreApi = {
//     getAll: async (): Promise<BookStore[]> => {
//         // Token sẽ được thêm tự động bởi interceptor trong axios.ts
//         const response = await apiClient.get<BookStore[]>("/bookstores");
//         return response.data;
//     },
// };


export const bookstoreApi = {
    getAll: async (token: string): Promise<BookStore[]> => {
        const response = await apiClient.get<BookStore[]>("/bookstores", {
            params: { token },
        });
        return response.data;
    },
};