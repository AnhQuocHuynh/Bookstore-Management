import { apiClient } from "@/lib/axios";

export const supplierApi = {
  // Lấy danh sách
  getAll: async () => {
    const response = await apiClient.get("/suppliers");
    return response.data;
  },

  // Tạo mới (POST)
  create: (data: unknown) => apiClient.post("/suppliers", data),

  // Cập nhật (PATCH)
  update: (id: string, data: unknown) => apiClient.patch(`/suppliers/${id}`, data),

  // Xóa (DELETE)
  delete: (id: string) => apiClient.delete(`/suppliers/${id}`),
};