import Step1SendEmail from "@/features/auth/components/forget-password/Step1SendEmail";
import Step2VerifyOtp from "@/features/auth/components/forget-password/Step2VerifyOtp";
import Step3ChangePassword from "@/features/auth/components/forget-password/Step3ChangePassword";
import Step4ChangePasswordSuccess from "@/features/auth/components/forget-password/Step4ChangePasswordSuccess";
import { useForgetPassword } from "@/features/auth/hooks/use-forget-password";
import { useResetPassword } from "@/features/auth/hooks/use-reset-password";
import { useVerifyOtp } from "@/features/auth/hooks/use-verify-otp";
import {
  ForgetPasswordFormValues,
  forgetPasswordSchema,
} from "@/features/auth/schema/forget-password.schema";
import { OtpTypeEnum } from "@/features/auth/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import z from "zod";

export const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1);
  const { mutate, isPending } = useForgetPassword();
  const { mutate: mutateVerifyOtp, isPending: isVerifyPending } =
    useVerifyOtp();
  const [authCode, setAuthCode] = useState<string>("");
  const { mutate: mutateResetPassword, isPending: isResetPending } =
    useResetPassword();

  const form = useForm<ForgetPasswordFormValues>({
    resolver: zodResolver(forgetPasswordSchema),
    mode: "onTouched",
    defaultValues: {
      password: "",
      confirmPassword: "",
      email: "",
      otp: "",
    },
  });

  const next = async () => {
    form.clearErrors();
    setStep((s) => s + 1);
  };

  const handleNextStep3 = () => {
    if (!form.getValues("otp") || isVerifyPending) return;

    mutateVerifyOtp(
      {
        email: form.getValues("email"),
        type: OtpTypeEnum.RESET_PASSWORD,
        otp: form.getValues("otp"),
      },
      {
        onSuccess: (data) => {
          if (data && data.message && data.authCode) {
            toast.success(data.message);
            setAuthCode(data.authCode);
            next();
          }
        },
      },
    );
  };

  const handleNextStep2 = () => {
    if (!form.getValues("email") || isPending) return;

    mutate(
      {
        email: form.getValues("email"),
      },
      {
        onSuccess: (data) => {
          if (data && data.message) {
            toast.success(data.message);
            next();
          }
        },
      },
    );
  };

  const handleSubmit = (values: z.infer<typeof forgetPasswordSchema>) => {
    if (!authCode?.trim()) {
      toast.error(
        "Quy trình đặt lại mật khẩu mới của bạn đã hết hạn. Vui lòng thực hiện lại từ đầu.",
      );
      return;
    }

    mutateResetPassword(
      {
        email: values.email,
        newPassword: values.password,
        authCode,
      },
      {
        onSuccess: (data) => {
          if (data) {
            toast.success("Đặt lại mật khẩu thành công.");
            next();
          }
        },
      },
    );
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-linear-to-br! 
    from-[#99dad4] to-[#88b7b2] px-4"
    >
      <div className="w-full max-w-md">
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="max-w-xl mx-auto py-10 px-10 bg-white rounded-3xl shadow-lg p-8">
              {step !== 4 && (
                <Link
                  to="/auth/login"
                  className="inline-flex items-center text-sm font-semibold text-[#26A69A] hover:text-[#00796B] mb-8 transition-colors group"
                >
                  <span className="mr-1 group-hover:-translate-x-1 transition-transform">
                    ←
                  </span>{" "}
                  Quay lại Đăng nhập
                </Link>
              )}

              {step !== 4 && (
                <div className="flex flex-col gap-1 items-center text-center mb-8">
                  <h1 className="text-2xl font-bold text-gray-800">
                    Quên mật khẩu?
                  </h1>
                  <p className="text-sm text-gray-500">
                    Vui lòng nhập email của bạn và làm theo các bước hướng dẫn
                    để tiến hành đặt lại mật khẩu. Sau khi hoàn tất, bạn có thể
                    tiếp tục quản lý nhà sách dễ dàng với{" "}
                    <span className="font-extrabold text-[#00796B]">
                      BookFlow
                    </span>
                    .
                  </p>
                </div>
              )}

              {step === 1 && (
                <Step1SendEmail
                  onNext={handleNextStep2}
                  isPending={isPending}
                />
              )}

              {step === 2 && (
                <Step2VerifyOtp
                  onNext={handleNextStep3}
                  onBack={() => setStep(1)}
                  email={form.getValues("email")}
                  isPending={isVerifyPending}
                />
              )}

              {step === 3 && <Step3ChangePassword isPending={isResetPending} />}

              {step === 4 && <Step4ChangePasswordSuccess />}
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};
