import { apiClient } from "@/lib/axios";
import { CreatePurchaseOrderDto, PurchaseOrderListParams, PurchaseOrderListItem, PurchaseOrderDetail } from "../types";

export const purchaseOrderApi = {
    create: async (data: CreatePurchaseOrderDto) => {
        const response = await apiClient.post("/purchase-orders", data);
        return response.data;
    },

    // Lấy danh sách
    getAll: async (params?: PurchaseOrderListParams) => {
        const response = await apiClient.get<PurchaseOrderListItem[]>("/purchase-orders", { params });
        return response.data;
    },

    // Lấy chi tiết
    getById: async (id: string) => {
        const response = await apiClient.get<PurchaseOrderDetail>(`/purchase-orders/${id}`);
        return response.data;
    }
};