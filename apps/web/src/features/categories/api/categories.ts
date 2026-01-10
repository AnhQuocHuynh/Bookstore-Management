import { apiClient } from "@/lib/axios";

export const categoryApi = {
    // Lấy danh sách (Có thể truyền params phân trang, nhưng ở đây ta lấy mặc định rồi filter client)
    getAll: async () => {
        // API trả về { data: [...], total: ... } hoặc mảng tùy backend
        // Theo tài liệu bạn gửi: response trả về object có thuộc tính 'data' là mảng
        const response = await apiClient.get("/categories?limit=100");
        return response.data;
    },

    // Tạo mới
    create: (data: unknown) => apiClient.post("/categories", data),

    // Cập nhật
    update: (id: string, data: unknown) => apiClient.patch(`/categories/${id}`, data),

    // Xóa
    delete: (id: string) => apiClient.delete(`/categories/${id}`),
};