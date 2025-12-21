"use client";

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RegisterFormValues } from "@/features/auth/schema/register.schema";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { useNavigate } from "react-router-dom";

interface Step3SecurityProps {
  onBack: () => void;
}

export default function Step3Security({ onBack }: Step3SecurityProps) {
  const { control, handleSubmit } = useFormContext<RegisterFormValues>();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const onSubmit = (data: RegisterFormValues) => {
    navigate("/auth/verify-email");
    console.log("Submit:", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="relative">
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
                    className="absolute top-1/2 right-3 -translate-y-1/2 p-0 
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
                    className="absolute top-1/2 right-3 -translate-y-1/2 p-0 
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
        <Button type="submit" className="flex-1 cursor-pointer">
          Hoàn tất đăng ký
        </Button>
      </div>
    </form>
  );
}
