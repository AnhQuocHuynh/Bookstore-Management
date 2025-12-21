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
  const { setSystemToken } = useAuthStore(); // Dùng action setSystemToken

  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrUsername.trim() || !password.trim()) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    setIsLoading(true);
    try {
      const isOwner = emailOrUsername.includes("@");
      let response;

      // Bước 1: Gọi API lấy System Token
      if (isOwner) {
        response = await authApi.systemLoginOwner({
          email: emailOrUsername.trim(),
          password: password,
        });
      } else {
        response = await authApi.systemLoginEmployee({
          username: emailOrUsername.trim(),
        });
      }

      const token = response.token;
      if (!token) throw new Error("Không nhận được token");

      // XỬ LÝ USER PROFILE AN TOÀN
      // Với Employee: response chỉ có { token: "..." }, không có profile -> user = null
      // Với Owner: response có { token, profile: {...} } -> map user
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

      // Lưu vào Store: Token + Pass tạm + User (nếu có)
      setSystemToken(
        token,
        {
          email: isOwner ? emailOrUsername.trim() : undefined,
          username: !isOwner ? emailOrUsername.trim() : undefined,
          password: password, // Lưu pass để dùng cho bước sau
          role: isOwner ? "OWNER" : "EMPLOYEE"
        },
        userData as any // Employee sẽ là null, không sao cả
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
    <div className="w-full max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Đăng nhập</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Email (Chủ) hoặc Username (Nhân viên)"
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
        <Button type="primary" block htmlType="submit" loading={isLoading}>
          Tiếp tục
        </Button>
      </form>
    </div>
  );
};

export default LoginPage;