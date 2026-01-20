import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsApi } from "../api/settings.api";
import type { UpdateSettingsDto } from "../types";
import { useAuthStore } from "@/stores/useAuthStore";

// Query keys
export const SETTINGS_QUERY_KEY = ["store-settings"];

// Hook lấy settings
export function useSettings() {
  return useQuery({
    queryKey: SETTINGS_QUERY_KEY,
    queryFn: () => settingsApi.getSettings(),
    staleTime: 5 * 60 * 1000, // 5 phút
  });
}

// Hook cập nhật settings
export function useUpdateSettings() {
  const queryClient = useQueryClient();
  const updateCurrentStore = useAuthStore((state) => state.updateCurrentStore);

  return useMutation({
    mutationFn: (data: UpdateSettingsDto) => settingsApi.updateSettings(data),
    onSuccess: (updatedSettings) => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY });
      
      // Sync với currentStore trong useAuthStore để sidebar cập nhật
      if (updatedSettings?.general) {
        const storeUpdate: Record<string, string | undefined> = {};
        if (updatedSettings.general.storeName) {
          storeUpdate.name = updatedSettings.general.storeName;
        }
        if (updatedSettings.general.address) {
          storeUpdate.address = updatedSettings.general.address;
        }
        if (updatedSettings.general.phone) {
          storeUpdate.phone = updatedSettings.general.phone;
        }
        if (updatedSettings.general.logoUrl) {
          storeUpdate.logoUrl = updatedSettings.general.logoUrl;
        }
        if (Object.keys(storeUpdate).length > 0) {
          updateCurrentStore(storeUpdate);
        }
      }
    },
  });
}

// Hook upload file
export function useUploadFile() {
  return useMutation({
    mutationFn: (file: File) => settingsApi.uploadFile(file),
  });
}
