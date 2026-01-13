import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { purchaseOrderApi } from "../api/purchase-order.api";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import { PurchaseOrderListParams } from "../types";


export const useCreatePurchaseOrder = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: purchaseOrderApi.create,
        onSuccess: () => {
            message.success("Tạo đơn nhập hàng thành công!");
            queryClient.invalidateQueries({ queryKey: ["products"] }); // Refresh lại kho
            navigate("/inventory"); // Chuyển hướng về kho hoặc danh sách đơn nhập
        },
        onError: (error: any) => {
            message.error(error?.response?.data?.message || "Lỗi khi tạo đơn nhập hàng");
        },
    });
};

export const usePurchaseOrders = (params?: PurchaseOrderListParams) => {
    return useQuery({
        queryKey: ["purchase-orders", params],
        queryFn: () => purchaseOrderApi.getAll(params),
    });
};

export const usePurchaseOrderDetail = (id: string | null) => {
    return useQuery({
        queryKey: ["purchase-order-detail", id],
        queryFn: () => purchaseOrderApi.getById(id!),
        enabled: !!id, // Chỉ gọi khi có ID
    });
};