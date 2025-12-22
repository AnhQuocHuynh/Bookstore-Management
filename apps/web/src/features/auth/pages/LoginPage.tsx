// src/features/auth/pages/LoginPage.tsx
import LoginForm from "@/features/auth/components/LoginForm";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { authApi } from "../api/auth.api";
import { useAuthStore } from "@/stores/useAuthStore";
import { z } from "zod";

const formSchema = z.object({
  emailOrUsername: z.string().min(1, "Vui lòng nhập email hoặc username"),
  password: z.string().min(1, "Mật khẩu không được để trống"),
  rememberMe: z.boolean().optional(),
});

const LoginPage = () => {
  const navigate = useNavigate();
  const { setSystemToken } = useAuthStore();

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      const isOwner = values.emailOrUsername.includes("@");
      let response;

      if (isOwner) {
        response = await authApi.systemLoginOwner({
          email: values.emailOrUsername.trim(),
          password: values.password,
        });
      } else {
        response = await authApi.systemLoginEmployee({
          username: values.emailOrUsername.trim(),
        });
      }

      const token = response.token;
      if (!token) throw new Error("Không nhận được token");

      let userData = null;
      if (response.profile) {
        userData = {
          id: response.profile.id,
          email: response.profile.email,
          name: response.profile.fullName,
          role: response.profile.role,
          avatar: response.profile.avatarUrl,
        };
      }

      setSystemToken(
        token,
        {
          email: isOwner ? values.emailOrUsername.trim() : undefined,
          username: !isOwner ? values.emailOrUsername.trim() : undefined,
          password: values.password, // Lưu tạm password
          role: isOwner ? "OWNER" : "EMPLOYEE",
        },
        userData as any
      );

      toast.success("Xác thực thành công!");
      navigate("/auth/select-store");
    } catch (error: any) {
      console.error("Login Error:", error);
      const msg = error.response?.data?.message || "Đăng nhập thất bại";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center w-full">
      <ScrollArea className="h-dvh w-full flex justify-center">
        <div className="w-full max-w-md px-4 py-10">
          <Link
            to="/"
            className="inline-flex items-center text-sm font-semibold text-[#26A69A] 
            hover:text-[#00796B] mb-8 group"
          >
            <span className="mr-1 group-hover:-translate-x-1 transition-transform">
              ←
            </span>
            Quay Lại
          </Link>

          <LoginForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
      </ScrollArea>
    </div>
  );
};

export default LoginPage;