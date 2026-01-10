import { apiClient } from "@/lib/axios";

// Định nghĩa kiểu dữ liệu mà Server trả về
interface UploadResponse {
    url: string;
}

export const uploadApi = {
    uploadFile: async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append("file", file);

        // Thêm <UploadResponse> để TypeScript hiểu cấu trúc dữ liệu trả về
        const response = await apiClient.post<UploadResponse>("/files/upload", formData);

        // SỬA LỖI: Truy cập vào response.data.url thay vì response.url
        return response.data.url;
    },
};