import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsApi } from "../api/settings.api";
import type { UpdateSettingsDto } from "../types";

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

  return useMutation({
    mutationFn: (data: UpdateSettingsDto) => settingsApi.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY });
    },
  });
}

// Hook upload file
export function useUploadFile() {
  return useMutation({
    mutationFn: (file: File) => settingsApi.uploadFile(file),
  });
}
