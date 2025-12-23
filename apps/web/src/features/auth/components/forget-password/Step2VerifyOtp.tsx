"use client";

import { Button } from "@/components/ui/button";
import {
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
import { ForgetPasswordFormValues } from "@/features/auth/schema/forget-password.schema";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";

interface Step2VerifyOtpProps {
  onNext: () => void;
  onBack: () => void;
}

const RESEND_INTERVAL = 60; // 60 giây

const Step2VerifyOtp = ({ onNext, onBack }: Step2VerifyOtpProps) => {
  const { control } = useFormContext<ForgetPasswordFormValues>();

  // khởi tạo resendTimer dựa trên localStorage
  const getInitialTimer = () => {
    const lastSent = localStorage.getItem("otpLastSent");
    if (!lastSent) return 0;

    const diff = Math.max(
      RESEND_INTERVAL - Math.floor((Date.now() - Number(lastSent)) / 1000),
      0
    );
    return diff;
  };

  const [resendTimer, setResendTimer] = useState<number>(getInitialTimer);

  // countdown mỗi giây
  useEffect(() => {
    if (resendTimer === 0) return;

    const interval = setInterval(() => {
      setResendTimer((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleResendOTP = () => {
    console.log("Resend OTP request sent!");
    localStorage.setItem("otpLastSent", Date.now().toString());
    setResendTimer(RESEND_INTERVAL);
  };

  return (
    <div className="space-y-5">
      <FormField
        control={control}
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

      <p className="text-center text-sm text-gray-500">
        Vui lòng nhập <span className="font-bold">mã xác thực</span> đã được gửi
        vào email của bạn.
      </p>

      {/* Resend OTP */}
      <div className="text-center">
        {resendTimer > 0 ? (
          <p className="text-sm text-gray-500">
            Bạn có thể gửi lại OTP sau{" "}
            <span className="font-bold">{resendTimer}</span> giây.
          </p>
        ) : (
          <button
            type="button"
            onClick={handleResendOTP}
            className="text-sm font-semibold text-emerald-600 hover:underline cursor-pointer"
          >
            Gửi lại OTP
          </button>
        )}
      </div>

      <div className="flex items-center justify-center gap-2 mt-2">
        <Button
          variant="outline"
          type="button"
          onClick={onBack}
          className="cursor-pointer"
        >
          Quay lại
        </Button>
        <Button onClick={onNext} className="w-full cursor-pointer">
          Xác thực
        </Button>
      </div>
    </div>
  );
};

export default Step2VerifyOtp;
