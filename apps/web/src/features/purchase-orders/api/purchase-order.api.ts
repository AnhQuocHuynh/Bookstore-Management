import { apiClient } from "@/lib/axios";
import { CreatePurchaseOrderDto } from "../types";

export const purchaseOrderApi = {
    create: async (data: CreatePurchaseOrderDto) => {
        const response = await apiClient.post("/purchase-orders", data);
        return response.data;
    },
};