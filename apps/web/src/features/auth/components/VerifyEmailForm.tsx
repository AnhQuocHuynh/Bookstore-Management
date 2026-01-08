"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useResendOtp } from "@/features/auth/hooks/use-resend-otp";
import { useVerifyOtp } from "@/features/auth/hooks/use-verify-otp";
import { OtpTypeEnum } from "@/features/auth/types";
import { useAuthStore } from "@/stores/useAuthStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

const RESEND_INTERVAL = 60;

const formSchema = z.object({
  otp: z.string().length(6, "Mã xác thực không hợp lệ"),
});

const VerifyEmailForm = () => {
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { otp: "" },
  });
  const { registerTemp, setRegisterTemp } = useAuthStore();
  const { mutate, isPending } = useVerifyOtp();
  const { mutate: mutateResendOtp, isPending: isResendOtpPending } =
    useResendOtp();

  const [resendTimer, setResendTimer] = useState(() => {
    const lastSent = localStorage.getItem("otpLastSent");
    if (lastSent) {
      const diff = Math.max(
        RESEND_INTERVAL - Math.floor((Date.now() - Number(lastSent)) / 1000),
        0,
      );
      return diff;
    }
    return 0;
  });

  useEffect(() => {
    if (resendTimer <= 0) return;

    const timer: ReturnType<typeof setInterval> = setInterval(() => {
      setResendTimer((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleResendOTP = () => {
    if (isResendOtpPending || !registerTemp) return;

    mutateResendOtp(
      {
        email: registerTemp.email,
        type: OtpTypeEnum.SIGN_UP,
      },
      {
        onSuccess: (data: any) => {
          if (data) {
            toast.success("Mã OTP đã được gửi vào email của bạn.");
            localStorage.setItem("otpLastSent", Date.now().toString());
            setResendTimer(RESEND_INTERVAL);
          }
        },
      },
    );
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!registerTemp) return;

    mutate(
      {
        email: registerTemp.email,
        otp: values.otp,
        type: OtpTypeEnum.SIGN_UP,
      },
      {
        onSuccess: (data: any) => {
          if (data && data.message) {
            setRegisterTemp(null);
            toast.success(data.message);
            navigate("/auth/verify-email/success");
          }
        },
      },
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="otp"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-2 items-center">
              <FormControl>
                <InputOTP
                  pattern={REGEXP_ONLY_DIGITS}
                  maxLength={6}
                  value={field.value || ""}
                  onChange={field.onChange}
                >
                  <InputOTPGroup>
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <InputOTPSlot key={i} index={i} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />

        <div className="text-center">
          {resendTimer > 0 ? (
            <p className="text-sm text-gray-500">
              Bạn có thể yêu cầu gửi lại mã xác thực sau{" "}
              <span className="font-bold">{resendTimer}</span> giây.
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResendOTP}
              className="text-sm font-semibold text-emerald-600 hover:underline cursor-pointer"
            >
              Gửi lại mã xác thực
            </button>
          )}
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="
              w-full mt-2 cursor-pointer
            "
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Đang xử lý...
            </span>
          ) : (
            "Xác nhận"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default VerifyEmailForm;
