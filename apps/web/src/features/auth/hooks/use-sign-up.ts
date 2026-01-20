import { authApi } from "@/features/auth/api/auth.api";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const useSignUp = () => {
  return useMutation({
    mutationFn: authApi.register,
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Đăng nhập thất bại";
      toast.error(msg);
    },
  });
};
