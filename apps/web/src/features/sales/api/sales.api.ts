// src/features/sales/api/sales.api.ts
import { apiClient } from "@/lib/axios";
import { Transaction, TransactionParams } from "../types/sales.types";

export const salesApi = {
    getTransactions: async (params?: TransactionParams): Promise<Transaction[]> => {
        const response = await apiClient.get<Transaction[]>("/transactions", {
            params,
        });
        return response.data;
    },
};