import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userApi } from "../api/users";

export const useUsers = () => {
  return useQuery({
    queryKey: ["user"],
    queryFn: () => userApi.getAll(),
  });
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: () => userApi.getMe(),
  });
};

export const useUpdateCurrentUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => userApi.updateMe(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
};
