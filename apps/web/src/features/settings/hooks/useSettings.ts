import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsApi } from "../api/settings.api";
import { UpdateBookStoreDto } from "../types";
import { useAuthStore } from "@/stores/useAuthStore";

// Query key
export const SETTINGS_QUERY_KEY = "bookstore-settings";

// Hook lấy thông tin cửa hàng
export function useBookStoreSettings() {
  const currentStore = useAuthStore((state) => state.currentStore);

  return useQuery({
    queryKey: [SETTINGS_QUERY_KEY, currentStore?.id],
    queryFn: () => {
      if (!currentStore?.id) {
        throw new Error("No store selected");
      }
      return settingsApi.getBookStoreDetail(currentStore.id);
    },
    enabled: !!currentStore?.id,
    staleTime: 5 * 60 * 1000, // 5 phút
  });
}

// Hook cập nhật thông tin cửa hàng
export function useUpdateBookStore() {
  const queryClient = useQueryClient();
  const currentStore = useAuthStore((state) => state.currentStore);

  return useMutation({
    mutationFn: (data: UpdateBookStoreDto) => {
      if (!currentStore?.id) {
        throw new Error("No store selected");
      }
      return settingsApi.updateBookStore(currentStore.id, data);
    },
    onSuccess: () => {
      // Invalidate cache để refetch data mới
      queryClient.invalidateQueries({ queryKey: [SETTINGS_QUERY_KEY] });
    },
  });
}

// Hook upload logo
export function useUploadLogo() {
  return useMutation({
    mutationFn: (file: File) => settingsApi.uploadLogo(file),
  });
}
