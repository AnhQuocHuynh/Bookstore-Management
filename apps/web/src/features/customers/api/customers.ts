import { apiClient } from "@/lib/axios";

export const customerApi = {
  // Lấy danh sách (trả về Array)
  getAll: async () => {
    const response = await apiClient.get("/customers");
    return response.data;
  },

  // Tạo mới
  create: (data: unknown) => apiClient.post("/customers", data),

  // Cập nhật
  update: (id: string, data: unknown) => apiClient.patch(`/customers/${id}`, data),

  // Xóa
  delete: (id: string) => apiClient.delete(`/customers/${id}`),
};