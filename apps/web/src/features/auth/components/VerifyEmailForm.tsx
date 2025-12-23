"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { zodResolver } from "@hookform/resolvers/zod";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
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

  const [resendTimer, setResendTimer] = useState(() => {
    const lastSent = localStorage.getItem("otpLastSent");
    if (lastSent) {
      const diff = Math.max(
        RESEND_INTERVAL - Math.floor((Date.now() - Number(lastSent)) / 1000),
        0
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
    console.log("Resend OTP request sent!");
    localStorage.setItem("otpLastSent", Date.now().toString());
    setResendTimer(RESEND_INTERVAL);
    // TODO: gọi API gửi lại OTP
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log("OTP entered:", values.otp);
    // TODO: call verify OTP API
    navigate("/auth/verify-email/success");
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

        <Button type="submit" className="w-full mt-2 cursor-pointer">
          Xác nhận
        </Button>
      </form>
    </Form>
  );
};

export default VerifyEmailForm;
