// src/features/sales/hooks/use-transactions.ts
import { useQuery } from "@tanstack/react-query";
import { salesApi } from "../api/sales.api";
import { TransactionParams } from "../types/sales.types";

export const useTransactions = (params?: TransactionParams) => {
    return useQuery({
        queryKey: ["transactions", params],
        queryFn: () => salesApi.getTransactions(params),
        staleTime: 1000 * 60, // 1 phút
    });
};