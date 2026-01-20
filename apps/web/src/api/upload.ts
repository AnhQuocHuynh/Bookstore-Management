import { apiClient } from "@/lib/axios";

// Định nghĩa kiểu dữ liệu trả về từ Server
interface UploadResponse {
    url: string;
}

export const uploadApi = {
    uploadFile: async (file: File): Promise<string> => {
        // 1. Khởi tạo FormData
        const formData = new FormData();

        // 2. QUAN TRỌNG: Key bắt buộc phải là 'file' (khớp với @UseInterceptors(FileInterceptor('file')) ở Backend)
        formData.append("file", file);

        // 3. Gọi API với header chính xác
        const response = await apiClient.post<UploadResponse>("/files/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        // Trả về URL ảnh
        return response.data.url;
    },
};