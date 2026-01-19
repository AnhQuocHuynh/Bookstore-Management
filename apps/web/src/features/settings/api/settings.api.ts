import { apiClient } from "@/lib/axios";
import type { StoreSettings, UpdateSettingsDto, ShiftTimesResponse } from "../types";

export const settingsApi = {
  // Lấy toàn bộ cài đặt cửa hàng
  getSettings: async (): Promise<StoreSettings> => {
    const response = await apiClient.get<StoreSettings>("/settings");
    return response.data;
  },

  // Cập nhật cài đặt (partial update)
  updateSettings: async (data: UpdateSettingsDto): Promise<StoreSettings> => {
    const response = await apiClient.patch<StoreSettings>("/settings", data);
    return response.data;
  },

  // Lấy thời gian các ca làm việc từ settings
  getShiftTimes: async (): Promise<ShiftTimesResponse> => {
    const response = await apiClient.get<ShiftTimesResponse>("/settings/shift-times");
    return response.data;
  },

  // Upload file (logo, etc.)
  uploadFile: async (file: File): Promise<{ url: string }> => {
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
