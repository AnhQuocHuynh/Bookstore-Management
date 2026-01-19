import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsApi } from "../api/settings.api";
import type { UpdateSettingsDto } from "../types";

// Query keys
export const SETTINGS_QUERY_KEY = ["store-settings"];
export const SHIFT_TIMES_QUERY_KEY = ["shift-times"];

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
      // Invalidate cả settings và shift times vì HR settings ảnh hưởng đến shifts
      queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: SHIFT_TIMES_QUERY_KEY });
    },
  });
}

// Hook lấy thời gian các ca làm việc từ settings
export function useShiftTimes() {
  return useQuery({
    queryKey: SHIFT_TIMES_QUERY_KEY,
    queryFn: () => settingsApi.getShiftTimes(),
    staleTime: 5 * 60 * 1000, // 5 phút
  });
}

// Hook upload file
export function useUploadFile() {
  return useMutation({
    mutationFn: (file: File) => settingsApi.uploadFile(file),
  });
}
