// src/features/sales/hooks/use-calculate-transaction.ts
import { useMutation } from "@tanstack/react-query";
import { salesApi } from "../api/sales.api";
import { CalculateTransactionDto } from "../types/sales.types";

export const useCalculateTransaction = () => {
    return useMutation({
        mutationFn: (data: CalculateTransactionDto) => salesApi.calculateDetails(data),
    });
};