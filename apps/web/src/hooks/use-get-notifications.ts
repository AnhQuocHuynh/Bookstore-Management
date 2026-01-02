import { useQuery } from "@tanstack/react-query";
import { UserNotification } from "@/types/notification";
import apiClient from "@/lib/axios";

export const useGetNotifications = (userId: string) => {
  return useQuery<UserNotification[], Error>({
    queryKey: ["notification", userId],
    queryFn: getUserNotifications,
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

const getUserNotifications = async () => {
  const response = await apiClient.get("/notifications");
  return response.data;
};
