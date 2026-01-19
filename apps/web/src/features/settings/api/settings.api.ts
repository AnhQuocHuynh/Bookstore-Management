import { apiClient } from "@/lib/axios";
import { BookStoreSettings, UpdateBookStoreDto } from "../types";

export const settingsApi = {
  // Lấy thông tin chi tiết cửa hàng
  getBookStoreDetail: async (bookStoreId: string): Promise<BookStoreSettings> => {
    const response = await apiClient.get<BookStoreSettings>(`/bookstores/detail/${bookStoreId}`);
    return response.data;
  },

  // Cập nhật thông tin cửa hàng
  updateBookStore: async (
    bookStoreId: string,
    data: UpdateBookStoreDto
  ): Promise<{ message: string; data: BookStoreSettings }> => {
    const response = await apiClient.patch<{ message: string; data: BookStoreSettings }>(
      `/bookstores/${bookStoreId}`,
      data
    );
    return response.data;
  },

  // Upload logo
  uploadLogo: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post<{ url: string }>("/files/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};
