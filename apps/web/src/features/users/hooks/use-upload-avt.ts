import { userApi } from "@/features/users/api/users";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const useUploadAvt = () => {
  return useMutation<
    { url: string }, // TData
    any, // TError
    File // TVariables
  >({
    mutationFn: userApi.uploadAvt,
    onError: (error) => {
      const msg = error.response?.data?.message || "Có lỗi xảy ra từ server";
      toast.error(msg);
    },
  });
};
