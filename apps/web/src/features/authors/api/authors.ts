import { apiClient } from "@/lib/axios";

export const authorApi = {
    // Lấy danh sách (có hỗ trợ keyword từ API)
    getAll: async (keyword?: string) => {
        const params = keyword ? { keyword } : undefined;
        const response = await apiClient.get("/authors", { params });
        return response.data;
    },

    // Tạo mới
    create: (data: unknown) => apiClient.post("/authors", data),

    // Cập nhật
    update: (id: string, data: unknown) => apiClient.patch(`/authors/${id}`, data),

    // Xóa
    delete: (id: string) => apiClient.delete(`/authors/${id}`),
};