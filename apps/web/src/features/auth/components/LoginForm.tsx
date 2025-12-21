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
  email: z.email("Email không hợp lệ"),
  password: z.string().min(1, "Mật khẩu không được để trống"),
  rememberMe: z.boolean().optional(),
});

const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    console.log(values);

    // fake loading demo
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }

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
          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-1">
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="user@example.com" {...field} />
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
                      className="pr-12"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="
              absolute right-3 top-1/2 -translate-y-1/2
              rounded-md p-2
              text-gray-500 hover:text-gray-700
              hover:bg-transparent
              transition
            "
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
                        className="focus:ring-emerald-500"
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

          {/* Social login */}
          <SocialLogin
            onGoogleLogin={() => {
              console.log("Login with Google");
              // window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
            }}
            onFacebookLogin={() => {
              console.log("Login with Facebook");
              // window.location.href = `${import.meta.env.VITE_API_URL}/auth/facebook`;
            }}
          />

          <Button
            type="submit"
            disabled={isLoading}
            className="
              h-14 w-full rounded-2xl
              bg-linear-to-r from-emerald-500 to-teal-600
              hover:from-emerald-600 hover:to-teal-700
              text-base font-bold text-white
              shadow-lg hover:shadow-xl
              transition-all cursor-pointer
            "
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

          {/* Register */}
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
