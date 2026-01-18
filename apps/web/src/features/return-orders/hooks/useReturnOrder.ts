import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { returnOrderApi } from "../api/return-order.api";
import { message } from "antd";
import { ReturnOrderListParams } from "../types";

export const useReturnOrders = (params?: ReturnOrderListParams) => {
  return useQuery({
    queryKey: ["return-orders", params],
    queryFn: async () => {
      const response = await returnOrderApi.getAll(params);
      return response.data;
    },
  });
};

export const useReturnOrderDetail = (id: string | null) => {
  return useQuery({
    queryKey: ["return-order-detail", id],
    queryFn: async () => {
      const response = await returnOrderApi.getById(id!);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateReturnOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: returnOrderApi.create,
    onSuccess: () => {
      console.log("[useCreateReturnOrder] Success!");
      message.success("Tạo đơn trả/đổi hàng thành công!");
      queryClient.invalidateQueries({ queryKey: ["return-orders"] });
    },
    onError: (error: any) => {
      console.error("[useCreateReturnOrder] Error:", error);
      console.error("[useCreateReturnOrder] Error response:", error?.response);
      console.error("[useCreateReturnOrder] Error data:", error?.response?.data);
      console.error("[useCreateReturnOrder] Status:", error?.response?.status);
      
      const errorMessage = error?.response?.data?.message || "Lỗi khi tạo đơn trả/đổi hàng";
      message.error(errorMessage);
    },
  });
};

export const useAddReturnOrderDetail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      returnOrderApi.addDetail(id, data),
    onSuccess: () => {
      message.success("Thêm chi tiết thành công!");
      queryClient.invalidateQueries({ queryKey: ["return-order-detail"] });
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || "Lỗi khi thêm chi tiết");
    },
  });
};

export const useUpdateReturnOrderDetail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, detailId, data }: { id: string; detailId: string; data: any }) =>
      returnOrderApi.updateDetail(id, detailId, data),
    onSuccess: () => {
      message.success("Cập nhật chi tiết thành công!");
      queryClient.invalidateQueries({ queryKey: ["return-order-detail"] });
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || "Lỗi khi cập nhật chi tiết");
    },
  });
};

export const useDeleteReturnOrderDetail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, detailId }: { id: string; detailId: string }) =>
      returnOrderApi.deleteDetail(id, detailId),
    onSuccess: () => {
      message.success("Xóa chi tiết thành công!");
      queryClient.invalidateQueries({ queryKey: ["return-order-detail"] });
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || "Lỗi khi xóa chi tiết");
    },
  });
};

export const useRecalculateRefund = () => {
  return useMutation({
    mutationFn: returnOrderApi.recalculate,
    onSuccess: () => {
      message.success("Tính lại tổng tiền hoàn thành công!");
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || "Lỗi khi tính lại");
    },
  });
};

export const useRejectReturnOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: returnOrderApi.reject,
    onSuccess: () => {
      message.success("Từ chối đơn thành công!");
      queryClient.invalidateQueries({ queryKey: ["return-orders"] });
      queryClient.invalidateQueries({ queryKey: ["return-order-detail"] });
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || "Lỗi khi từ chối đơn");
    },
  });
};

export const useApproveReturnOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: returnOrderApi.approve,
    onSuccess: () => {
      message.success("Duyệt đơn thành công!");
      queryClient.invalidateQueries({ queryKey: ["return-orders"] });
      queryClient.invalidateQueries({ queryKey: ["return-order-detail"] });
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || "Lỗi khi duyệt đơn");
    },
  });
};

export const useDeleteReturnOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        console.log("[useDeleteReturnOrder] Starting delete for order:", id);
        
        // First, fetch the order to get all details
        console.log("[useDeleteReturnOrder] Fetching order details...");
        const orderResponse = await returnOrderApi.getById(id);
        const order = orderResponse.data;
        console.log("[useDeleteReturnOrder] Order fetched:", order);

        // Delete all details first
        if (order.details && order.details.length > 0) {
          console.log(`[useDeleteReturnOrder] Deleting ${order.details.length} details...`);
          for (const detail of order.details) {
            try {
              console.log(`[useDeleteReturnOrder] Deleting detail: ${detail.id}`);
              await returnOrderApi.deleteDetail(id, detail.id);
              console.log(`[useDeleteReturnOrder] Detail deleted successfully: ${detail.id}`);
            } catch (detailError) {
              console.error(`[useDeleteReturnOrder] Error deleting detail ${detail.id}:`, detailError);
              throw detailError;
            }
          }
        }

        // Then delete the order itself
        console.log("[useDeleteReturnOrder] Deleting order...");
        const result = await returnOrderApi.delete(id);
        console.log("[useDeleteReturnOrder] Order deleted successfully");
        return result;
      } catch (error: any) {
        console.error("[useDeleteReturnOrder] Full error object:", error);
        console.error("[useDeleteReturnOrder] Error response:", error?.response);
        console.error("[useDeleteReturnOrder] Error status:", error?.response?.status);
        console.error("[useDeleteReturnOrder] Error data:", error?.response?.data);
        throw error;
      }
    },
    onSuccess: () => {
      message.success("Xóa đơn thành công!");
      queryClient.invalidateQueries({ queryKey: ["return-orders"] });
      queryClient.invalidateQueries({ queryKey: ["return-order-detail"] });
    },
    onError: (error: any) => {
      console.error("[useDeleteReturnOrder] onError callback:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Lỗi khi xóa đơn";
      message.error(errorMessage);
    },
  });
};

export const useUpdateReturnOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      returnOrderApi.update(id, data),
    onSuccess: () => {
      message.success("Cập nhật đơn thành công!");
      queryClient.invalidateQueries({ queryKey: ["return-orders"] });
      queryClient.invalidateQueries({ queryKey: ["return-order-detail"] });
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || "Lỗi khi cập nhật đơn");
    },
  });
};
