"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useSignUp } from "@/features/auth/hooks/use-sign-up";
import { RegisterFormValues } from "@/features/auth/schema/register.schema";
import { useAuthStore } from "@/stores/useAuthStore";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Step3SecurityProps {
  onBack: () => void;
}

export default function Step3Security({ onBack }: Step3SecurityProps) {
  const { control, handleSubmit } = useFormContext<RegisterFormValues>();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { setRegisterTemp } = useAuthStore();
  const { mutate, isPending } = useSignUp();

  const onSubmit = (data: RegisterFormValues) => {
    if (data) {
      mutate(
        {
          email: data.email,
          password: data.password,
          fullName: data.fullName,
          phoneNumber: data.phoneNumber,
          birthDate: data.birthDate,
          address: data.address,
          createBookStoreDto: {
            name: data.storeName,
            phoneNumber: data.storePhoneNumber,
            address: data.storeAddress,
          },
        },
        {
          onSuccess: (dataResponse: any) => {
            if (dataResponse && dataResponse.message) {
              toast.success(dataResponse.message);
              setRegisterTemp(data);
              navigate("/auth/verify-email");
            }
          },
        },
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="relative flex flex-col items-center justify-center text-center">
        <h1 className="text-lg font-semibold text-[#00796B]">
          Bảo mật tài khoản
        </h1>
        <p className="text-sm text-gray-500">
          Vui lòng tạo mật khẩu để bảo vệ tài khoản của bạn
        </p>
      </div>

      {/* Mật khẩu */}
      <FormField
        control={control}
        name="password"
        render={({ field }) => {
          const inputId = "password-input";
          return (
            <FormItem className="flex flex-col relative gap-1">
              <FormLabel htmlFor={inputId}>Mật khẩu</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    id={inputId}
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu"
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    className="absolute inset-y-0 right-3 flex items-center p-0
             bg-transparent hover:bg-transparent focus:bg-transparent active:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </Button>
                </div>
              </FormControl>
              <FormMessage className="text-red-500" />
            </FormItem>
          );
        }}
      />

      {/* Xác nhận mật khẩu */}
      <FormField
        control={control}
        name="confirmPassword"
        render={({ field }) => {
          const inputId = "confirm-password-input";
          return (
            <FormItem className="flex flex-col relative gap-1">
              <FormLabel htmlFor={inputId}>Xác nhận mật khẩu</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    id={inputId}
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Nhập lại mật khẩu"
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    className="absolute inset-y-0 right-3 flex items-center p-0
             bg-transparent hover:bg-transparent focus:bg-transparent active:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </Button>
                </div>
              </FormControl>
              <FormMessage className="text-red-500" />
            </FormItem>
          );
        }}
      />

      <FormField
        control={control}
        name="agreeTerms"
        render={({ field }) => (
          <FormItem className="flex flex-col gap-1">
            <FormControl>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="agreeTerms"
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked)}
                />
                <FormLabel
                  htmlFor="agreeTerms"
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  Tôi đồng ý với{" "}
                  <span className="text-emerald-600 font-semibold hover:underline">
                    Điều khoản & Chính sách.
                  </span>
                </FormLabel>
              </div>
            </FormControl>
            <FormMessage className="text-red-500" />
          </FormItem>
        )}
      />

      {/* Buttons */}
      <div className="flex gap-3 mt-6">
        <Button
          variant="outline"
          type="button"
          onClick={onBack}
          className="flex-1 cursor-pointer"
        >
          Quay lại
        </Button>

        <Button
          type="submit"
          disabled={isPending}
          className="flex-1 cursor-pointer"
        >
          {isPending ? "Đang xử lý..." : "Hoàn tất đăng ký"}
        </Button>
      </div>
    </form>
  );
}
