import { apiClient } from "@/lib/axios";

// Định nghĩa kiểu dữ liệu trả về từ API
export interface ProductResponse {
    id: string;
    sku: string;
    name: string;
    description: string;
    price: number;
    imageUrl?: string;
    type: string;
    isActive: boolean;
    unit?: string;
    inventory?: {
        availableQuantity: number;
    };
}

export const productsApi = {
    search: async (keyword: string): Promise<ProductResponse[]> => {
        try {
            const response = await apiClient.get<any>("/products", {
                params: {
                    isActive: true,
                    keyword: keyword,
                    // limit: 10, // <--- XÓA DÒNG NÀY (Nguyên nhân gây lỗi 400)

                    // Thêm các tham số sắp xếp cho giống mẫu Curl bạn đưa nếu cần
                    sortBy: 'createdAt',
                    sortOrder: 'desc'
                },
            });

            // --- XỬ LÝ DỮ LIỆU TRẢ VỀ ---
            // Nếu API trả về mảng trực tiếp: [ {...}, {...} ]
            if (Array.isArray(response.data)) {
                return response.data;
            }
            // Nếu API trả về object có chứa data: { data: [...], total: ... }
            else if (response.data && Array.isArray(response.data.data)) {
                return response.data.data;
            }

            return [];
        } catch (error: any) {
            // --- DEBUG LỖI 400 ---
            console.error("API Error Details:", error.response?.data);
            throw error; // Ném lỗi ra để React Query bắt được và hiện UI màu đỏ
        }
    },
};