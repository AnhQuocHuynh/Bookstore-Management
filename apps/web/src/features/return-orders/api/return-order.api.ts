import { apiClient } from "@/lib/axios";

export const returnOrderApi = {
  
  // chưa có api nma nên thêm
  // Lấy danh sách đơn trả/đổi
  //getAll: (params?: unknown) => apiClient.get("/return-orders", { params }),

  // Lấy chi tiết đơn trả/đổi
  getById: (id: string) => apiClient.get(`/return-orders/${id}`),

  // Tạo mới đơn trả/đổi
  create: (data: unknown) => {
    return apiClient.post("/return-orders", data);
  },

  // Thêm chi tiết vào đơn
  addDetail: (id: string, data: unknown) =>
    apiClient.post(`/return-orders/${id}/details`, data),

  // Cập nhật chi tiết đơn
  updateDetail: (id: string, detailId: string, data: unknown) =>
    apiClient.patch(`/return-orders/${id}/details/${detailId}`, data),

  // Xóa chi tiết đơn
  deleteDetail: (id: string, detailId: string) =>
    apiClient.delete(`/return-orders/${id}/details/${detailId}`),

  // Tính lại tổng tiền hoàn
  recalculate: (id: string) =>
    apiClient.post(`/return-orders/${id}/recalculate`),

  // Từ chối đơn trả/đổi
  reject: (id: string, data?: unknown) =>
    apiClient.post(`/return-orders/${id}/reject`, data || {}),

  // Duyệt đơn trả/đổi
  approve: (id: string) => apiClient.post(`/return-orders/${id}/approve`),

  // chưa có api nma nên thêm
  // Xóa đơn trả/đổi (stub for compatibility)
  //delete: (id: string) => apiClient.delete(`/return-orders/${id}`),
  };
