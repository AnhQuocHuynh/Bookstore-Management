import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useChangeFirstLoginPassword } from "@/features/auth/hooks/use-change-first-login-password";
import { useLoginBookStoreEmployee } from "@/features/auth/hooks/use-login-bookstore-employee";
import { changeFirstLoginPasswordSchema } from "@/features/auth/schema/change-first-login-password.schema";
import { Store, useAuthStore } from "@/stores/useAuthStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { message } from "antd";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import z from "zod";

interface ChangeFirstLoginPasswordProps {
  tempTokenLogin: string;
  username: string;
  storeData: Store;
}

const ChangeFirstLoginPassword: React.FC<ChangeFirstLoginPasswordProps> = ({
  tempTokenLogin,
  username,
  storeData,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const form = useForm<z.infer<typeof changeFirstLoginPasswordSchema>>({
    resolver: zodResolver(changeFirstLoginPasswordSchema),
    shouldUnregister: true,
    defaultValues: {
      password: "",
      confirmPassword: "",
      currentPassword: "",
    },
  });
  const { mutate, isPending } = useChangeFirstLoginPassword();
  const { tokenFirstLogin, setStoreToken } = useAuthStore();
  const navigate = useNavigate();
  const { mutate: mutateLogin } = useLoginBookStoreEmployee();

  const onSubmit = (values: z.infer<typeof changeFirstLoginPasswordSchema>) => {
    if (!tokenFirstLogin) return;
    mutate(
      {
        currentPassword: values.currentPassword,
        newPassword: values.password,
        token: tokenFirstLogin,
      },
      {
        onSuccess: (data) => {
          if (data && data?.message) {
            toast.success(data.message);
            mutateLogin(
              {
                username,
                password: values.password,
                bookStoreId: storeData.id,
                token: tempTokenLogin,
              },
              {
                onSuccess: (d) => {
                  if (d) {
                    setStoreToken(d.accessToken, storeData, d.profile);
                    message.success(
                      `Đăng nhập thành công vào: ${storeData.name}`,
                    );
                    navigate("/dashboard");
                  }
                },
              },
            );
          }
        },
      },
    );
  };

  return (
    <section className="relative">
      <div></div>

      <div className="relative flex flex-col gap-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => {
                const inputId = "current-password-input";
                return (
                  <FormItem className="flex flex-col relative gap-1">
                    <FormLabel htmlFor={inputId}>Mật khẩu hiện tại</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          id={inputId}
                          type={showCurrentPassword ? "text" : "password"}
                          placeholder="Nhập mật khẩu hiện tại của bạn"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          className="absolute inset-y-0 right-3 flex items-center p-0
                        bg-transparent hover:bg-transparent focus:bg-transparent active:bg-transparent"
                          onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                        >
                          {showCurrentPassword ? (
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
              control={form.control}
              name="password"
              render={({ field }) => {
                const inputId = "password-input";
                return (
                  <FormItem className="flex flex-col relative gap-1">
                    <FormLabel htmlFor={inputId}>Mật khẩu mới</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          id={inputId}
                          type={showPassword ? "text" : "password"}
                          placeholder="Nhập mật khẩu mới của bạn"
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

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => {
                const inputId = "confirm-password-input";
                return (
                  <FormItem className="flex flex-col relative gap-1">
                    <FormLabel htmlFor={inputId}>
                      Xác nhận mật khẩu mới
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          id={inputId}
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Nhập lại mật khẩu mới"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          className="absolute inset-y-0 right-3 flex items-center p-0
             bg-transparent hover:bg-transparent focus:bg-transparent active:bg-transparent"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
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
              type="submit"
              disabled={isPending}
              className="
              h-14 w-full rounded-2xl
              border-0 text-white
              !bg-gradient-to-r !from-emerald-500 !to-teal-600
              hover:!from-emerald-600 hover:!to-teal-700
              shadow-lg hover:shadow-xl
              text-base font-bold
            "
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Đang xử lý...
                </span>
              ) : (
                "Đổi mật khẩu"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </section>
  );
};

export default ChangeFirstLoginPassword;
