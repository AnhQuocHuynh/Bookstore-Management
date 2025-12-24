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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SocialLogin from "@/features/auth/components/SocialLogin";
import { loginSchema } from "@/features/auth/schema/login.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";

type LoginFormProps = {
  onSubmit: (values: z.infer<typeof loginSchema>) => void;
  isLoading: boolean;
};

const LoginForm = ({ onSubmit, isLoading }: LoginFormProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    shouldUnregister: true,
    defaultValues: {
      role: "owner",
      email: "",
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  const role = form.watch("role");
  const isAdminOrOwner = role === "admin" || role === "owner";

  return (
    <div className="relative flex flex-col gap-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vai trò đăng nhập</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn vai trò đăng nhập" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="owner">Chủ nhà sách</SelectItem>
                    <SelectItem value="employee">Nhân viên nhà sách</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* EMAIL (Admin / Owner) */}
          {isAdminOrOwner && (
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="admin@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* USERNAME (Employee) */}
          {role === "employee" && (
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="employee_01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* PASSWORD (Admin / Owner) */}
          {isAdminOrOwner && (
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="password">Mật khẩu</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Nhập mật khẩu của bạn"
                        className="pr-12"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 top-0 h-full w-12 flex items-center justify-center"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {isAdminOrOwner && (
            <div className="flex items-center justify-between text-sm">
              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="rememberMe"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <FormLabel
                          htmlFor="rememberMe"
                          className="cursor-pointer select-none"
                        >
                          Ghi nhớ đăng nhập
                        </FormLabel>
                      </div>
                    </FormControl>
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
          )}

          {isAdminOrOwner && (
            <SocialLogin
              onGoogleLogin={() => console.log("Login with Google")}
              onFacebookLogin={() => console.log("Login with Facebook")}
            />
          )}

          <Button
            type="submit"
            disabled={isLoading || !role}
            className="
              h-14 w-full rounded-2xl
              border-0 text-white
              !bg-gradient-to-r !from-emerald-500 !to-teal-600
              hover:!from-emerald-600 hover:!to-teal-700
              shadow-lg hover:shadow-xl
              text-base font-bold
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
