import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ForgetPasswordFormValues } from "@/features/auth/schema/forget-password.schema";
import { Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";
import { useFormContext } from "react-hook-form";

interface Step3ChangePasswordProps {
  isPending: boolean;
}

const Step3ChangePassword: React.FC<Step3ChangePasswordProps> = ({
  isPending,
}) => {
  const { control } = useFormContext<ForgetPasswordFormValues>();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="space-y-5">
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

      <Button
        className="w-full cursor-pointer mt-2"
        type="submit"
        disabled={isPending}
      >
        {isPending ? "Đang xử lý..." : "Đặt lại mật khẩu"}
      </Button>
    </div>
  );
};

export default Step3ChangePassword;
