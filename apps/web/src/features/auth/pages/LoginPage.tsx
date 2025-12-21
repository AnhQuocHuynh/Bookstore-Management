// src/features/auth/pages/LoginPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Checkbox, Input } from "antd";
import { toast } from "sonner";
import { authApi } from "../api/auth.api";
import { useAuthStore } from "@/stores/useAuthStore";
import { Eye, EyeOff } from "lucide-react";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", { emailOrUsername, password });

    if (!emailOrUsername.trim() || !password.trim()) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    setIsLoading(true);

    try {
      let response;
      const isOwner = emailOrUsername.includes("@"); // Detect Owner nếu có @ (email)

      console.log("Dữ liệu gửi đi:", {
        emailOrUsername,
        password,
        isOwner: emailOrUsername.includes("@")
      });

      if (isOwner) {
        // Owner/Admin system login
        response = await authApi.systemLoginOwner({
          email: emailOrUsername,
          password,
        });
      } else {
        // Employee system login (chỉ username)
        response = await authApi.systemLoginEmployee({
          username: emailOrUsername,
        });
      }

      console.log("API response:", response);
      const token = response.token;
      if (!token) throw new Error("Không nhận được token");

      const user = {
        id: response.profile.id,
        email: response.profile.email || "",
        name: response.profile.fullName,
        role: response.profile.role,
        avatar: response.profile.avatarUrl,
      };

      // Lưu temp credentials (password cần cho bookstore login)
      const tempCreds = {
        [isOwner ? "email" : "username"]: emailOrUsername,
        password,
        role: user.role as "OWNER" | "EMPLOYEE",
      };

      login(user, token, tempCreds);
      toast.success("Đăng nhập hệ thống thành công!");
      navigate("/auth/select-store");
    } catch (error: any) {
      console.error("Lỗi đăng nhập chi tiết:", error);
      console.error("Response từ server:", error.response?.data);
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Đăng nhập thất bại. Vui lòng thử lại.";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Đăng nhập</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Email (Owner/Admin) hoặc Username (Employee)"
          value={emailOrUsername}
          onChange={(e) => setEmailOrUsername(e.target.value)}
        />
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}>
          Ghi nhớ đăng nhập
        </Checkbox>
        <Button type="primary" block htmlType="submit" loading={isLoading}>
          Đăng nhập
        </Button>
      </form>
    </div>
  );
};

export default LoginPage;