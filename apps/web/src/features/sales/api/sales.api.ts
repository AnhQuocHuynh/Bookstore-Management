// src/features/sales/api/sales.api.ts
import { apiClient } from "@/lib/axios";
import {
    Transaction,
    TransactionParams,
    CreateTransactionDto,
    TransactionResponse,
    CalculateTransactionDto,
    CalculationResponse
} from "../types/sales.types";

export const salesApi = {
    getTransactions: async (params?: TransactionParams): Promise<Transaction[]> => {
        const response = await apiClient.get<Transaction[]>("/transactions", { params });
        return response.data;
    },

    // 1. API Tính toán hóa đơn (Pre-check)
    calculateDetails: async (data: CalculateTransactionDto): Promise<CalculationResponse> => {
        const response = await apiClient.post<CalculationResponse>("/transactions/details", data);
        return response.data;
    },

    // 2. API Tạo hóa đơn (Thanh toán)
    create: async (data: CreateTransactionDto): Promise<TransactionResponse> => {
        const response = await apiClient.post<TransactionResponse>("/transactions", data);
        return response.data;
    },
};