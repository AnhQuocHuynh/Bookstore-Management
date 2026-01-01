import { authApi } from "@/features/auth/api/auth.api";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const useResendOtp = () => {
  return useMutation({
    mutationFn: authApi.resendOtp,
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Có lỗi xảy ra từ server";
      toast.error(msg);
    },
  });
};
