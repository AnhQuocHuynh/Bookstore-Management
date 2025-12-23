import Step1SendEmail from "@/features/auth/components/forget-password/Step1SendEmail";
import Step2VerifyOtp from "@/features/auth/components/forget-password/Step2VerifyOtp";
import Step3ChangePassword from "@/features/auth/components/forget-password/Step3ChangePassword";
import {
  ForgetPasswordFormValues,
  forgetPasswordSchema,
} from "@/features/auth/schema/forget-password.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { FieldPath, FormProvider, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1);

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

  const next = async (fields: FieldPath<ForgetPasswordFormValues>[]) => {
    const valid = await form.trigger(fields);
    if (valid) setStep((s) => s + 1);
  };

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Vui lòng nhập email");
      return;
    }

    // setIsLoading(true);

    // try {
    //   const response = await authApi.checkEmail(email);
    //   toast.success(
    //     response.message || "Mã OTP đã được gửi đến email của bạn."
    //   );

    //   // Redirect to verify OTP page or login
    //   setTimeout(() => {
    //     navigate("/auth/login");
    //   }, 2000);
    // } catch (error: any) {
    //   console.error("Forgot password error:", error);
    //   const errorMessage =
    //     error?.response?.data?.message ||
    //     error?.message ||
    //     "Có lỗi xảy ra. Vui lòng thử lại.";
    //   toast.error(errorMessage);
    // } finally {
    //   setIsLoading(false);
    // }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-linear-to-br! 
    from-[#99dad4] to-[#88b7b2] px-4"
    >
      <div className="w-full max-w-md">
        <FormProvider {...form}>
          <div className="max-w-xl mx-auto py-10 px-10 bg-white rounded-3xl shadow-lg p-8">
            <Link
              to="/auth/login"
              className="inline-flex items-center text-sm font-semibold text-[#26A69A] hover:text-[#00796B] mb-8 transition-colors group"
            >
              <span className="mr-1 group-hover:-translate-x-1 transition-transform">
                ←
              </span>{" "}
              Quay lại Đăng nhập
            </Link>

            <div className="flex flex-col gap-1 items-center text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-800">
                Quên mật khẩu?
              </h1>
              <p className="text-sm text-gray-500">
                Vui lòng nhập email của bạn và làm theo các bước hướng dẫn để
                tiến hành đặt lại mật khẩu. Sau khi hoàn tất, bạn có thể tiếp
                tục quản lý nhà sách dễ dàng với{" "}
                <span className="font-extrabold text-[#00796B]">BookFlow</span>.
              </p>
            </div>

            {step === 1 && <Step1SendEmail onNext={() => next(["email"])} />}

            {step === 2 && (
              <Step2VerifyOtp
                onNext={() => next(["otp"])}
                onBack={() => setStep(1)}
              />
            )}

            {step === 3 && <Step3ChangePassword />}

            {/* {step === 2 && (
              <Step2Owner
                onBack={() => setStep(1)}
                onNext={() =>
                  next([
                    "fullName",
                    "email",
                    "phoneNumber",
                    "birthDate",
                    "address",
                  ])
                }
              />
            )} */}

            {/* {step === 3 && <Step3Security onBack={() => setStep(2)} />} */}
          </div>
        </FormProvider>
      </div>
    </div>
  );
};
