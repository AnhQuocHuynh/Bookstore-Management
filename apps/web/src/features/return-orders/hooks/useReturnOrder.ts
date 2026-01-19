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
      message.success("Tạo đơn trả/đổi hàng thành công!");
      queryClient.invalidateQueries({ queryKey: ["return-orders"] });
    },
    onError: (error: any) => {
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
        const orderResponse = await returnOrderApi.getById(id);
        const order = orderResponse.data;

        // Delete all details first
        if (order.details && order.details.length > 0) {
          for (const detail of order.details) {
            try {
              await returnOrderApi.deleteDetail(id, detail.id);
            } catch (detailError) {
              throw detailError;
            }
          }
        }

        const result = await returnOrderApi.delete(id);
        return result;
      } catch (error: any) {
        throw error;
      }
    },
    onSuccess: () => {
      message.success("Xóa đơn thành công!");
      queryClient.invalidateQueries({ queryKey: ["return-orders"] });
      queryClient.invalidateQueries({ queryKey: ["return-order-detail"] });
    },
    onError: (error: any) => {
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
