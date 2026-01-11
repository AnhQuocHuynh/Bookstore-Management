import { apiClient } from "@/lib/axios";

export const publisherApi = {
    // Lấy danh sách (trả về Array)
    getAll: async () => {
        const response = await apiClient.get("/publishers");
        return response.data;
    },

    // Tạo mới
    create: (data: unknown) => apiClient.post("/publishers", data),

    // Cập nhật
    update: (id: string, data: unknown) => apiClient.patch(`/publishers/${id}`, data),

    // Xóa
    delete: (id: string) => apiClient.delete(`/publishers/${id}`),
};