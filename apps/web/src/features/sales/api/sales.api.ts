import { apiClient } from "@/lib/axios";
import { Transaction, TransactionParams, CreateTransactionDto, TransactionResponse } from "../types/sales.types"; // Import thêm các type mới

export const salesApi = {
    getTransactions: async (params?: TransactionParams): Promise<Transaction[]> => {
        const response = await apiClient.get<Transaction[]>("/transactions", {
            params,
        });
        return response.data;
    },

    // Thêm hàm create transaction
    create: async (data: CreateTransactionDto): Promise<TransactionResponse> => {
        const response = await apiClient.post<TransactionResponse>("/transactions", data);
        return response.data;
    },
};