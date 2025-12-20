import { ScrollArea } from "@/components/ui/scroll-area";
import SocialLogin from "@/features/auth/components/SocialLogin";
import Step1Store from "@/features/auth/components/Step1StoreInfo";
import Step2Owner from "@/features/auth/components/Step2OwnerInfo";
import Step3Security from "@/features/auth/components/Step3Security";
import {
  RegisterFormValues,
  registerSchema,
} from "@/features/auth/schema/register.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { FieldPath, FormProvider, useForm } from "react-hook-form";
import { Link } from "react-router-dom";

export default function RegisterPage() {
  const [step, setStep] = useState(1);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    defaultValues: {
      storeAddress: "",
      storePhoneNumber: "",
      storeName: "",
      fullName: "",
      address: "",
      phoneNumber: "",
      birthDate: "",
      password: "",
      confirmPassword: "",
      email: "",
    },
  });

  const next = async (fields: FieldPath<RegisterFormValues>[]) => {
    const valid = await form.trigger(fields);
    if (valid) setStep((s) => s + 1);
  };

  return (
    <ScrollArea className="h-dvh w-full flex justify-center mb-10">
      <FormProvider {...form}>
        <div className="max-w-lg mx-auto py-10 px-4">
          <Link
            to="/auth/login"
            className="inline-flex items-center text-sm font-semibold text-[#26A69A] 
            hover:text-[#00796B] mb-8 group"
          >
            <span className="mr-1 group-hover:-translate-x-1 transition-transform">
              ←
            </span>
            Quay lại
          </Link>

          <div className="flex flex-col gap-1 items-center text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">
              Tạo mới Nhà sách
            </h1>
            <p className="text-sm text-gray-500">
              Tạo tài khoản và bắt đầu quản lý nhà sách của bạn dễ dàng và hiệu
              quả với{" "}
              <span className="font-extrabold text-[#00796B]">BookFlow</span>.
              Chỉ mất vài bước đơn giản để bắt đầu!
            </p>
          </div>

          {/* Steps */}
          {step === 1 && (
            <Step1Store
              onNext={() =>
                next(["storeName", "storePhoneNumber", "storeAddress"])
              }
            />
          )}

          {step === 2 && (
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
          )}

          {step === 3 && <Step3Security onBack={() => setStep(2)} />}
        </div>

        <SocialLogin
          onGoogleLogin={() => {
            console.log("Login with Google");
            // window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
          }}
          onFacebookLogin={() => {
            console.log("Login with Facebook");
            // window.location.href = `${import.meta.env.VITE_API_URL}/auth/facebook`;
          }}
          label="Hoặc đăng ký với"
        />

        <p className="text-center text-sm text-gray-600 mt-6">
          Đã có tài khoản?{" "}
          <Link
            to="/auth/login"
            className="font-semibold text-emerald-600 hover:underline"
          >
            Đăng nhập
          </Link>
        </p>
      </FormProvider>
    </ScrollArea>
  );
}
