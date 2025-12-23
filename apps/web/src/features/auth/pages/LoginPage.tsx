import { authApi } from "@/features/auth/api/auth.api";
import LoginForm from "@/features/auth/components/LoginForm";
import { loginSchema } from "@/features/auth/schema/login.schema";
import { useAuthStore } from "@/stores/useAuthStore";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

const LoginPage = () => {
  const navigate = useNavigate();
  const { setSystemToken } = useAuthStore();

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    try {
      const { role, email, password, username } = values;
      const isAdminOrOwnerRole = role === "admin" || role === "owner";
      let response;

      if (isAdminOrOwnerRole && email?.trim() && password?.trim()) {
        response = await authApi.systemLoginOwner({
          email,
          password,
        });
      } else if (username?.trim()) {
        response = await authApi.systemLoginEmployee({
          username,
        });
      }

      if (!response) return;

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
          email: isAdminOrOwnerRole ? values?.email?.trim() : undefined,
          username: !isAdminOrOwnerRole ? values?.username?.trim() : undefined,
          password: values.password ?? "",
          role: isAdminOrOwnerRole ? "OWNER" : "EMPLOYEE",
        },
        userData as any,
      );

      toast.success("Đăng nhập thành công!");
      navigate("/select-store");
    } catch (error: any) {
      console.error("Login Error:", error.response?.data);
      const msg = error.response?.data?.message || "Đăng nhập thất bại";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-full">
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

        <div className="flex flex-col gap-1 items-center text-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Chào mừng trở lại!
          </h1>
          <p className="text-sm text-gray-500">
            Đăng nhập để tiếp tục làm việc cùng{" "}
            <span className="font-semibold text-emerald-600">BookFlow</span>
          </p>
        </div>

        <hr className="border-t border-gray-300 my-3" />

        <LoginForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default LoginPage;
