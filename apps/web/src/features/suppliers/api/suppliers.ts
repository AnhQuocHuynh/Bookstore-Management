import { apiClient } from "@/lib/axios";

export const supplierApi = {
  getAll: async () => {
    const response = await apiClient.get("/suppliers");
    return response.data; // <--- Quan trọng: Trả về data bên trong response
  },

  // (Chuẩn bị sẵn cho các bước sau)
  getById: (id: string) => apiClient.get(`/suppliers/${id}`),
  create: (data: unknown) => apiClient.post("/suppliers", data),
  update: (id: string, data: unknown) => apiClient.patch(`/suppliers/${id}`, data),
  delete: (id: string) => apiClient.delete(`/suppliers/${id}`),
};