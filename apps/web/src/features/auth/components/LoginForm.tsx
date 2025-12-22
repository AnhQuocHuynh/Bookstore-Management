// src/features/auth/components/LoginForm.tsx
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import SocialLogin from "@/features/auth/components/SocialLogin";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";

const formSchema = z.object({
  emailOrUsername: z.string().min(1, "Vui lòng nhập email hoặc username"),
  password: z.string().min(1, "Mật khẩu không được để trống"),
  rememberMe: z.boolean().optional(),
});

type LoginFormProps = {
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  isLoading: boolean;
};

const LoginForm = ({ onSubmit, isLoading }: LoginFormProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emailOrUsername: "",
      password: "",
      rememberMe: false,
    },
  });

  return (
    <div className="relative flex flex-col gap-4 py-6">
      <div className="flex flex-col gap-1 items-center text-center">
        <h1 className="text-2xl font-bold text-gray-800">Chào mừng trở lại!</h1>
        <p className="text-sm text-gray-500">
          Đăng nhập để tiếp tục làm việc cùng{" "}
          <span className="font-semibold text-emerald-600">BookFlow</span>
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Email hoặc Username */}
          <FormField
            control={form.control}
            name="emailOrUsername"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-1">
                <FormLabel>Email hoặc Username</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Email (chủ) hoặc Username (nhân viên)"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-1">
                <FormLabel htmlFor="password">Mật khẩu</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pr-12" // Padding phải để chữ không đè lên icon
                      {...field}
                    />

                    {/* SỬA LỖI 2: Icon bị lệch */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="
                        absolute right-0 top-0 h-full w-12
                        flex items-center justify-center
                        text-gray-500 hover:text-gray-700
                        rounded-r-md
                        transition-colors
                        focus:outline-none
                      "
                    // Giải thích:
                    // top-0 h-full: Button cao bằng input
                    // flex items-center justify-center: Icon luôn ở chính giữa button
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between text-sm">
            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-1">
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="rememberMe"
                        checked={field.value}
                        onCheckedChange={(checked) => field.onChange(checked)}
                        className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 focus:ring-emerald-500"
                      />
                      <FormLabel
                        htmlFor="rememberMe"
                        className="text-sm text-gray-700 cursor-pointer"
                      >
                        Ghi nhớ đăng nhập
                      </FormLabel>
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <Link
              to="/auth/forgot-password"
              className="font-medium text-emerald-600 hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </div>

          <SocialLogin
            onGoogleLogin={() => console.log("Login with Google")}
            onFacebookLogin={() => console.log("Login with Facebook")}
          />

          {/* SỬA LỖI 1: Nút bị trắng */}
          <Button
            type="submit"
            disabled={isLoading}
            className="
              h-14 w-full rounded-2xl
              border-0 text-white
              !bg-gradient-to-r !from-emerald-500 !to-teal-600
              hover:!from-emerald-600 hover:!to-teal-700
              shadow-lg hover:shadow-xl
              text-base font-bold
              transition-all cursor-pointer
            "
          // Giải thích:
          // border-0: Xóa viền nếu button mặc định là outline
          // !bg-...: Dấu ! (important) ép buộc dùng màu gradient này đè lên màu mặc định của Shadcn
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Đang đăng nhập...
              </span>
            ) : (
              "Đăng nhập"
            )}
          </Button>

          <p className="text-center text-sm text-gray-600">
            Chưa có tài khoản?{" "}
            <Link
              to="/auth/register"
              className="font-semibold text-emerald-600 hover:underline"
            >
              Tạo tài khoản mới
            </Link>
          </p>
        </form>
      </Form>
    </div>
  );
};

export default LoginForm;